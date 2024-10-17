export type VSCLConfig = {
  /**
   * Specify the links to be handled by the extension.
   */
  links: VSCLLink[];
  /**
   * Extend from other configuration files.
   */
  extends?: string | string[];
};

export type VSCLLink = {
  /**
   * Include a glob string or array of glob strings that match the files in which to
   * search for links.
   */
  include?: string | string[];
  /**
   * Exclude a glob string or array of glob strings that match the files in which to
   * NOT search for links. This setting overrides the `include` setting.
   */
  exclude?: string | string[];
  /**
   * The pattern to use when searching for links. If you use a RegExp you can specify a named capturing
   * group to define the hitbox of the link. Example: `/text before that is not a link(?<link>https://example.com)text after that is not a link/g`.
   */
  pattern: RegExp | [RegExp, ...RegExp[]];
  /**
   * This function is called when the extension finds a link using the `pattern` property. From this function
   * you can return an object that specifies what the link opens (files, http links), what it should show when
   * you hover over it (tooltip), and (if you link to a file) where it should jump to (jumpPattern).
   *
   * @param options The information the extension gives you to handle the link.
   * @returns
   */
  handle: VSCLLinkHandler;
};

export type VSCLLinkHandler = (options: VSCLLinkHandlerOptions) => VSCLLinkHandlerResponse;
export type VSCLLinkHandlerResponse = {
  /**
   * The file or http link to open. Note that on windows use `file:///` instead of `file://`.
   */
  target: string;
  /**
   * The text to show when you hover over the link.
   */
  tooltip?: string;
  /**
   * The regex pattern or sub string to jump to within the target file.
   */
  jumpPattern?: RegExp | string;
  /**
   * The markdown-supported description to show when you hover over the link.
   */
  description?: string;
  /**
   * An array of additional buttons/links to show when you hover over the link.
   */
  buttons?: VSCLLinkButton[];
};
export type VSCLLinkButton =
  | {
      /**
       * The text to show on the button.
       */
      title: string;
      /**
       * The file or http link to open. Note that on windows use `file:///` instead of `file://`.
       */
      target: string;
    }
  | {
      /**
       * The text to show on the button.
       */
      title: string;
      /**
       * The function to call when the button is clicked. Can be used to copy text to the clipboard, for example.
       */
      action: () => void | Promise<void>;
    };
export type VSCLLinkHandlerOptions = {
  /**
   * The text of the pattern-matched link.
   */
  linkText: string;

  /**
   * A template literal tag that can be used to create a file path relative to the workspace.
   *
   * @example
   * workspace`/src/file.ts` // Results in: file:///C:/Users/user/projects/my-project/src/file.ts
   */
  workspace: (strings: TemplateStringsArray, ...values: string[]) => string;

  /**
   * A template literal tag that can be used to create a file path.
   *
   * @example
   * workspace`C:/Users/user/projects/my-project/src/file.ts` // Results in: file:///C:/Users/user/projects/my-project/src/file.ts
   */
  file: (strings: TemplateStringsArray, ...values: string[]) => string;

  /**
   * This function can be used to log messages to the "VSCode Links" output channel.
   */
  log: (...logs: any[]) => void;
};

export type Config = VSCLConfig;
