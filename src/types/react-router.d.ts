declare module 'react-router' {
  import * as React from 'react';
  
  export interface match<P> {
    params: P;
    isExact: boolean;
    path: string;
    url: string;
  }
  
  export interface matchPathOptions {
    path?: string | string[] | undefined;
    exact?: boolean | undefined;
    sensitive?: boolean | undefined;
    strict?: boolean | undefined;
  }
  
  export function matchPath<P = {}>(
    pathname: string,
    props: string | string[] | matchPathOptions | undefined,
    parent?: match<{}> | null
  ): match<P> | null;
  
  export function withRouter<P extends RouteComponentProps>(
    component: React.ComponentType<P>
  ): React.ComponentClass<Omit<P, keyof RouteComponentProps>> & { WrappedComponent: React.ComponentType<P> };
  
  export function withRouter<P extends {}>(
    component: React.ComponentType<P & RouteComponentProps>
  ): React.ComponentClass<P> & { WrappedComponent: React.ComponentType<P & RouteComponentProps> };
  
  export function withRouter<P extends {}>(
    component: React.ComponentType<P>
  ): React.ComponentClass<P> & { WrappedComponent: React.ComponentType<P> };
  
  export function withRouter<TFunction extends React.ComponentType<any>>(component: TFunction): TFunction;
  
  export interface RouteComponentProps<T = {}> {
    match: match<T>;
    location: any;
    history: any;
    staticContext?: any;
  }
  
  export interface RouteChildrenProps<P = {}> {
    match: match<P> | null;
  }
  
  export function useHistory(): any;
  
  export function useLocation(): any;
  
  export function useParams<T extends { [K in keyof T]?: string } = {}>(): T;
  
  export function useRouteMatch<P = {}>(
    path?: string | string[] | { path?: string | string[]; exact?: boolean; strict?: boolean; sensitive?: boolean } | undefined
  ): match<P> | null;
  
  export function generatePath(pattern: string, params?: { [paramName: string]: string | number | boolean | undefined | null }): string;
  
  export function matchPath<TParams = { [K in keyof TParams]?: string }>(
    pathname: string,
    props: string | string[] | { path?: string | string[]; exact?: boolean; strict?: boolean; sensitive?: boolean } | undefined,
    parent?: match<TParams> | null
  ): match<TParams> | null;
  
  export const __RouterContext: React.Context<any>;
  
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
