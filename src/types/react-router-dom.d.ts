declare module 'react-router-dom' {
  import * as React from 'react';
  import { RouteComponentProps, RouteChildrenProps, match, matchPath, withRouter } from 'react-router';
  
  export * from 'react-router';
  
  export interface BrowserRouterProps {
    basename?: string;
    getUserConfirmation?: ((message: string, callback: (ok: boolean) => void) => void) | undefined;
    forceRefresh?: boolean | undefined;
    keyLength?: number | undefined;
    children?: React.ReactNode;
  }
  
  export class BrowserRouter extends React.Component<BrowserRouterProps> {}
  
  export interface HashRouterProps {
    basename?: string | undefined;
    getUserConfirmation?: ((message: string, callback: (ok: boolean) => void) => void) | undefined;
    hashType?: 'hashbang' | 'noslash' | 'slash' | undefined;
    children?: React.ReactNode;
  }
  
  export class HashRouter extends React.Component<HashRouterProps> {}
  
  export interface LinkProps<S = any> {
    component?: React.ComponentType<any> | undefined;
    to: string | { pathname?: string; search?: string; hash?: string; state?: S };
    replace?: boolean | undefined;
    innerRef?: React.Ref<HTMLAnchorElement> | undefined;
    innerRef?: React.Ref<HTMLAnchorElement> | undefined;
    onClick?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
    target?: string | undefined;
    className?: string | ((props: { isActive: boolean }) => string) | undefined;
    style?: React.CSSProperties | ((props: { isActive: boolean }) => React.CSSProperties) | undefined;
    children?: React.ReactNode;
  }
  
  export function Link<S = any>(props: LinkProps<S>): React.ReactElement;
  
  export interface NavLinkProps<S = any> extends LinkProps<S> {
    activeClassName?: string | undefined;
    activeStyle?: React.CSSProperties | undefined;
    exact?: boolean | undefined;
    strict?: boolean | undefined;
    isActive?<P>(match: match<P> | null, location: any): boolean;
    location?: any;
    className?: string | ((props: { isActive: boolean }) => string) | undefined;
    style?: React.CSSProperties | ((props: { isActive: boolean }) => React.CSSProperties) | undefined;
  }
  
  export function NavLink<S = any>(props: NavLinkProps<S>): React.ReactElement;
  
  export interface MemoryRouterProps {
    initialEntries?: string[] | { pathname: string; search?: string; hash?: string; state?: any; key?: string }[] | undefined;
    initialIndex?: number | undefined;
    getUserConfirmation?: ((message: string, callback: (ok: boolean) => void) => void) | undefined;
    keyLength?: number | undefined;
    children?: React.ReactNode;
  }
  
  export class MemoryRouter extends React.Component<MemoryRouterProps> {}
  
  export interface PromptProps {
    message: string | ((location: any, action: string) => string | boolean);
    when?: boolean | undefined;
  }
  
  export class Prompt extends React.Component<PromptProps> {}
  
  export interface RedirectProps {
    to: string | { pathname: string; search?: string; hash?: string; state?: any };
    push?: boolean | undefined;
    from?: string | undefined;
    exact?: boolean | undefined;
    strict?: boolean | undefined;
  }
  
  export class Redirect extends React.Component<RedirectProps> {}
  
  export interface RouteComponentProps<T = {}> {
    history: {
      length: number;
      action: 'PUSH' | 'REPLACE' | 'POP';
      location: {
        pathname: string;
        search: string;
        hash: string;
        state: any;
        key?: string | undefined;
      };
      push(path: string, state?: any): void;
      push(location: { pathname?: string; search?: string; hash?: string; state?: any }): void;
      replace(path: string, state?: any): void;
      replace(location: { pathname?: string; search?: string; hash?: string; state?: any }): void;
      go(n: number): void;
      goBack(): void;
      goForward(): void;
      block(prompt?: boolean | string | (() => string | boolean)): () => void;
    };
    location: {
      pathname: string;
      search: string;
      hash: string;
      state: any;
      key?: string | undefined;
    };
    match: match<T> | null;
    staticContext?: any;
  }
  
  export interface RouteChildrenProps<P = {}, S = {}> {
    match: match<P> | null;
    location: any;
    history: any;
  }
  
  export interface RouteProps {
    location?: any;
    component?: React.ComponentType<any> | undefined;
    render?: ((props: RouteComponentProps<any>) => React.ReactNode) | undefined;
    children?: ((props: RouteChildrenProps<any>) => React.ReactNode) | React.ReactNode | undefined;
    path?: string | string[] | undefined;
    exact?: boolean | undefined;
    sensitive?: boolean | undefined;
    strict?: boolean | undefined;
  }
  
  export function Route<T extends RouteProps = RouteProps>(props: T): React.ReactElement | null;
  
  export interface RouterProps {
    history: any;
    children?: React.ReactNode;
  }
  
  export class Router extends React.Component<RouterProps> {}
  
  export interface StaticRouterProps {
    basename?: string | undefined;
    location?: string | any;
    context?: any;
    children?: React.ReactNode;
  }
  
  export class StaticRouter extends React.Component<StaticRouterProps> {}
  
  export interface SwitchProps {
    children?: React.ReactNode;
    location?: any;
  }
  
  export class Switch extends React.Component<SwitchProps> {}
  
  export function useHistory(): any;
  
  export function useLocation(): any;
  
  export function useParams<T extends { [K in keyof T]?: string } = {}>(): T;
  
  export function useRouteMatch<P = {}>(
    path?: string | string[] | { path?: string | string[]; exact?: boolean; strict?: boolean; sensitive?: boolean } | undefined
  ): match<P> | null;
  
  export function withRouter<P extends RouteComponentProps>(
    component: React.ComponentType<P>,
    options?: { withRef?: boolean | undefined }
  ): React.ComponentClass<Omit<P, keyof RouteComponentProps>> & { WrappedComponent: React.ComponentType<P> };
  
  export function withRouter<P extends {}>(
    component: React.ComponentType<P & RouteComponentProps>,
    options?: { withRef?: boolean | undefined }
  ): React.ComponentClass<P> & { WrappedComponent: React.ComponentType<P & RouteComponentProps> };
  
  export function withRouter<P extends {}>(
    component: React.ComponentType<P>,
    options?: { withRef?: boolean | undefined }
  ): React.ComponentClass<P> & { WrappedComponent: React.ComponentType<P> };
  
  export function withRouter<TFunction extends React.ComponentType<any>>(component: TFunction): TFunction;
  
  export function useHistory<T = any>(): any;
  
  export function useLocation<S = any>(): any;
  
  export function useParams<T extends { [K in keyof T]?: string } = {}>(): T;
  
  export function useRouteMatch<P = {}>(
    path?: string | string[] | { path?: string | string[]; exact?: boolean; strict?: boolean; sensitive?: boolean } | undefined
  ): match<P> | null;
  
  export function withRouter<P extends RouteComponentProps>(
    component: React.ComponentType<P>,
    options?: { withRef?: boolean | undefined }
  ): React.ComponentClass<Omit<P, keyof RouteComponentProps>> & { WrappedComponent: React.ComponentType<P> };
  
  export function withRouter<P extends {}>(
    component: React.ComponentType<P & RouteComponentProps>,
    options?: { withRef?: boolean | undefined }
  ): React.ComponentClass<P> & { WrappedComponent: React.ComponentType<P & RouteComponentProps> };
  
  export function withRouter<P extends {}>(
    component: React.ComponentType<P>,
    options?: { withRef?: boolean | undefined }
  ): React.ComponentClass<P> & { WrappedComponent: React.ComponentType<P> };
  
  export function withRouter<TFunction extends React.ComponentType<any>>(component: TFunction): TFunction;
  
  export function generatePath(pattern: string, params?: { [paramName: string]: string | number | boolean | undefined | null }): string;
  
  export function matchPath<TParams = { [K in keyof TParams]?: string }>(
    pathname: string,
    props: string | string[] | { path?: string | string[]; exact?: boolean; strict?: boolean; sensitive?: boolean } | undefined,
    parent?: match<TParams> | null
  ): match<TParams> | null;
  
  export function useHistory<T = any>(): any;
  
  export function useLocation<S = any>(): any;
  
  export function useParams<T extends { [K in keyof T]?: string } = {}>(): T;
  
  export function useRouteMatch<P = {}>(
    path?: string | string[] | { path?: string | string[]; exact?: boolean; strict?: boolean; sensitive?: boolean } | undefined
  ): match<P> | null;
  
  export function withRouter<P extends RouteComponentProps>(
    component: React.ComponentType<P>,
    options?: { withRef?: boolean | undefined }
  ): React.ComponentClass<Omit<P, keyof RouteComponentProps>> & { WrappedComponent: React.ComponentType<P> };
  
  export function withRouter<P extends {}>(
    component: React.ComponentType<P & RouteComponentProps>,
    options?: { withRef?: boolean | undefined }
  ): React.ComponentClass<P> & { WrappedComponent: React.ComponentType<P & RouteComponentProps> };
  
  export function withRouter<P extends {}>(
    component: React.ComponentType<P>,
    options?: { withRef?: boolean | undefined }
  ): React.ComponentClass<P> & { WrappedComponent: React.ComponentType<P> };
  
  export function withRouter<TFunction extends React.ComponentType<any>>(component: TFunction): TFunction;
  
  export function generatePath(pattern: string, params?: { [paramName: string]: string | number | boolean | undefined | null }): string;
  
  export function matchPath<TParams = { [K in keyof TParams]?: string }>(
    pathname: string,
    props: string | string[] | { path?: string | string[]; exact?: boolean; strict?: boolean; sensitive?: boolean } | undefined,
    parent?: match<TParams> | null
  ): match<TParams> | null;
}
