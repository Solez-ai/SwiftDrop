import * as React from 'react';

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Standard HTML Attributes
    accessKey?: string;
    className?: string;
    contentEditable?: Booleanish | "inherit";
    contextMenu?: string;
    dir?: string;
    draggable?: Booleanish;
    hidden?: boolean;
    id?: string;
    lang?: string;
    placeholder?: string;
    slot?: string;
    spellCheck?: Booleanish;
    style?: CSSProperties;
    tabIndex?: number;
    title?: string;
    translate?: 'yes' | 'no';
    
    // Unknown
    [key: string]: any;
  }
  
  interface CSSProperties extends CSS.Properties<string | number> {
    [key: `--${string}`]: string | number | undefined;
  }
  
  type Key = string | number;
  
  type Ref<T> = string | ((instance: T | null) => void) | React.RefObject<T> | null | undefined;
  
  // React-specific Attributes
  interface Attributes {
    key?: Key | null | undefined;
    jsx?: boolean | undefined;
  }
  
  // React-specific Attributes with Ref
  interface ClassAttributes<T> extends Attributes {
    ref?: Ref<T>;
  }
  
  // React-specific Attributes with Children
  interface ReactNodeArray extends Array<ReactNode> {}
  type ReactFragment = {} | ReactNodeArray;
  type ReactNode = ReactChild | ReactFragment | ReactPortal | boolean | null | undefined;
  
  // React-specific Attributes with Props
  interface Component<P = {}, S = {}, SS = any> extends ComponentLifecycle<P, S, SS> {}
  
  // React-specific Attributes with State
  interface ComponentState {}
  
  // React-specific Attributes with Props and State
  interface PureComponent<P = {}, S = {}, SS = any> extends Component<P, S, SS> {}
  
  // React-specific Attributes with Context
  interface Context<T> {
    Provider: Provider<T>;
    Consumer: Consumer<T>;
    displayName?: string | undefined;
  }
  
  // React-specific Attributes with Ref
  interface RefObject<T> {
    readonly current: T | null;
  }
  
  // React-specific Attributes with Children
  interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }
  
  // React-specific Attributes with Children
  interface ReactPortal extends ReactElement {
    children: ReactNode;
  }
  
  // React-specific Attributes with Children
  type ReactText = string | number;
  type ReactChild = ReactElement | ReactText;
  
  // React-specific Attributes with Children
  type FC<P = {}> = FunctionComponent<P>;
  
  // React-specific Attributes with Children
  interface FunctionComponent<P = {}> {
    (props: P, context?: any): ReactElement<any, any> | null;
    propTypes?: WeakValidationMap<P> | undefined;
    contextTypes?: ValidationMap<any> | undefined;
    defaultProps?: Partial<P> | undefined;
    displayName?: string | undefined;
  }
  
  // React-specific Attributes with Children
  interface ComponentClass<P = {}, S = ComponentState> extends StaticLifecycle<P, S> {
    new (props: P, context?: any): Component<P, S>;
    propTypes?: WeakValidationMap<P> | undefined;
    contextType?: Context<any> | undefined;
    contextTypes?: ValidationMap<any> | undefined;
    childContextTypes?: ValidationMap<any> | undefined;
    defaultProps?: Partial<P> | undefined;
    displayName?: string | undefined;
  }
  
  // Add missing type definitions
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
  
  type JSXElementConstructor<P> =
    | ((props: P) => ReactElement<any, any> | null)
    | (new (props: P) => Component<any, any>);
    
  type Key = string | number;
  
  type Ref<T> = string | ((instance: T | null) => void) | RefObject<T> | null | undefined;
  
  interface RefObject<T> {
    readonly current: T | null;
  }
  
  type ReactNode = ReactChild | ReactFragment | ReactPortal | boolean | null | undefined;
  
  type ReactText = string | number;
  
  type ReactChild = ReactElement | ReactText;
  
  interface ReactFragment extends Array<ReactNode> {}
  
  interface ReactPortal extends ReactElement {
    children: ReactNode;
  }
  
  type Provider<T> = React.Provider<T>;
  type Consumer<T> = React.Consumer<T>;
  
  type Booleanish = boolean | 'true' | 'false';
  
  interface DOMAttributes<T> {
    children?: ReactNode;
    dangerouslySetInnerHTML?: {
      __html: string;
    };
  }
  
  interface AriaAttributes {
    'aria-activedescendant'?: string | undefined;
    'aria-atomic'?: boolean | 'false' | 'true' | undefined;
    'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both' | undefined;
    'aria-busy'?: boolean | 'false' | 'true' | undefined;
    'aria-checked'?: boolean | 'false' | 'mixed' | 'true' | undefined;
    'aria-colcount'?: number | undefined;
    'aria-colindex'?: number | undefined;
    'aria-colspan'?: number | undefined;
    'aria-current'?: boolean | 'false' | 'true' | 'page' | 'step' | 'location' | 'date' | 'time' | undefined;
    'aria-describedby'?: string | undefined;
    'aria-details'?: string | undefined;
    'aria-disabled'?: boolean | 'false' | 'true' | undefined;
    'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup' | undefined;
    'aria-errormessage'?: string | undefined;
    'aria-expanded'?: boolean | 'false' | 'true' | undefined;
    'aria-flowto'?: string | undefined;
    'aria-grabbed'?: boolean | 'false' | 'true' | undefined;
    'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | undefined;
    'aria-hidden'?: boolean | 'false' | 'true' | undefined;
    'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling' | undefined;
    'aria-keyshortcuts'?: string | undefined;
    'aria-label'?: string | undefined;
    'aria-labelledby'?: string | undefined;
    'aria-level'?: number | undefined;
    'aria-live'?: 'off' | 'assertive' | 'polite' | undefined;
    'aria-modal'?: boolean | 'false' | 'true' | undefined;
    'aria-multiline'?: boolean | 'false' | 'true' | undefined;
    'aria-multiselectable'?: boolean | 'false' | 'true' | undefined;
    'aria-orientation'?: 'horizontal' | 'vertical' | undefined;
    'aria-owns'?: string | undefined;
    'aria-placeholder'?: string | undefined;
    'aria-posinset'?: number | undefined;
    'aria-pressed'?: boolean | 'false' | 'mixed' | 'true' | undefined;
    'aria-readonly'?: boolean | 'false' | 'true' | undefined;
    'aria-relevant'?: 'additions' | 'additions text' | 'all' | 'removals' | 'text' | 'additions removals' | 'additions text removals' | 'additions text removals' | undefined;
    'aria-required'?: boolean | 'false' | 'true' | undefined;
    'aria-roledescription'?: string | undefined;
    'aria-rowcount'?: number | undefined;
    'aria-rowindex'?: number | undefined;
    'aria-rowspan'?: number | undefined;
    'aria-selected'?: boolean | 'false' | 'true' | undefined;
    'aria-setsize'?: number | undefined;
    'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other' | undefined;
    'aria-valuemax'?: number | undefined;
    'aria-valuemin'?: number | undefined;
    'aria-valuenow'?: number | undefined;
    'aria-valuetext'?: string | undefined;
  }
}
