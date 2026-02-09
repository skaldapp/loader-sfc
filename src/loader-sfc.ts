import type { ParserPlugin } from "@babel/parser";
import type {
  CompilerOptions,
  SFCAsyncStyleCompileOptions,
  SFCParseOptions,
  SFCScriptCompileOptions,
  SFCTemplateCompileOptions,
} from "@vue/compiler-sfc";
import type { Options, Transform } from "sucrase";

import {
  compileScript,
  compileStyleAsync,
  compileTemplate,
  parse,
} from "@vue/compiler-sfc";
import hash_sum from "hash-sum";
import { transform } from "sucrase";

const fetching = async (input: string) => {
  try {
    const response = await fetch(input);
    if (response.ok) return await response.text();
    else throw new Error(response.statusText);
  } catch (error) {
    console.error(error);
  }
  return undefined;
};

export default async (
  sfc: string,
  {
    parseOptions,
    scriptOptions: {
      templateOptions: {
        compilerOptions: { expressionPlugins, ...restCompilerOptions } = {},
        ...restTemplateOptions
      } = {},
      ...restScriptOptions
    } = {},
    styleOptions,
  }:
    | undefined
    | {
        parseOptions?: Partial<SFCParseOptions>;
        scriptOptions?: Partial<SFCScriptCompileOptions>;
        styleOptions?: Partial<SFCAsyncStyleCompileOptions>;
      } = {},
) => {
  let styleWarning = "";

  const hash = hash_sum(sfc),
    styleErrors: Error[] = [],
    { descriptor, errors: parseErrors } = parse(
      sfc || "<template></template>",
      { filename: `${hash}.vue`, ...parseOptions },
    ),
    { filename, script, scriptSetup, slotted, styles, template } = descriptor;

  const id = `data-v-${hash}`,
    langs = new Set(
      [script, scriptSetup]
        .filter((scriptBlock) => scriptBlock !== null)
        .flatMap(
          ({ lang = "js" }) =>
            [
              ...(/[jt]sx$/.test(lang) ? ["jsx"] : []),
              ...(/tsx?$/.test(lang) ? ["typescript"] : []),
            ] as ParserPlugin[],
        ),
    ),
    compilerOptions: CompilerOptions = {
      expressionPlugins: [
        ...new Set([...(expressionPlugins ?? []), ...langs]),
      ] as ParserPlugin[],
      filename,
      scopeId: id,
      slotted,
      ...restCompilerOptions,
    },
    templateOptions: Partial<SFCTemplateCompileOptions> = {
      compilerOptions,
      filename,
      id,
      scoped: styles.some(({ scoped }) => scoped),
      slotted,
      ...restTemplateOptions,
    },
    scriptOptions: SFCScriptCompileOptions = {
      id,
      templateOptions,
      ...restScriptOptions,
    },
    style =
      document.getElementById(id) instanceof HTMLStyleElement
        ? Promise.resolve([])
        : Promise.all(
            styles.map(async ({ content, module, scoped = false, src }) => {
              const modules = !!module;
              if (modules && !styleWarning) {
                styleWarning =
                  "<style module> is not supported in the playground.";
                return "";
              } else {
                const { code, errors } = await compileStyleAsync({
                  filename,
                  id,
                  modules,
                  scoped,
                  source: src ? ((await fetching(src)) ?? "") : content,
                  ...styleOptions,
                });
                styleErrors.push(...errors);
                return code;
              }
            }),
          ),
    sucraseOptions: Options = {
      jsxRuntime: "preserve",
      transforms: [...langs] as Transform[],
    },
    { ast, content: source = "" } = template ?? {},
    {
      bindings,
      content,
      warnings: scriptWarnings,
    } = script || scriptSetup ? compileScript(descriptor, scriptOptions) : {};

  if (bindings) compilerOptions.bindingMetadata = bindings;

  const {
    code,
    errors: templateErrors,
    tips: templateTips,
  } = template && (!scriptSetup || !scriptOptions.inlineTemplate)
    ? compileTemplate({
        ...ast,
        filename,
        id,
        source,
        ...templateOptions,
      })
    : {};

  [...parseErrors, ...(templateErrors ?? []), ...styleErrors].forEach(
    console.error,
  );
  [...(scriptWarnings ?? []), ...(styleWarning ? [styleWarning] : [])].forEach(
    console.warn,
  );
  [...(templateTips ?? [])].forEach(console.info);

  const inject = async (code: string) => {
      const objectURL = URL.createObjectURL(
        new Blob([langs.size ? transform(code, sucraseOptions).code : code], {
          type: "application/javascript",
        }),
      );
      try {
        return (await import(objectURL)) as Record<string, object>;
      } finally {
        URL.revokeObjectURL(objectURL);
      }
    },
    [styleResult, scriptResult, templateResult] = await Promise.all([
      style,
      content ? inject(content) : Promise.resolve(undefined),
      code ? inject(code) : Promise.resolve(undefined),
    ]),
    textContent = styleResult.join("\n").trim();

  if (textContent) {
    const el = document.createElement("style");
    el.id = id;
    el.textContent = textContent;
    document.head.appendChild(el);
  }

  return { __scopeId: id, ...scriptResult?.["default"], ...templateResult };
};
