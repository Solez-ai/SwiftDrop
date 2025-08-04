declare module '@ionic/react' {
  import * as React from 'react';
  
  // Core Components
  export const IonApp: React.FC<React.HTMLAttributes<HTMLIonAppElement>>;
  export const IonPage: React.FC<React.HTMLAttributes<HTMLIonPageElement>>;
  export const IonContent: React.FC<React.HTMLAttributes<HTMLIonContentElement>>;
  export const IonHeader: React.FC<React.HTMLAttributes<HTMLIonHeaderElement>>;
  export const IonFooter: React.FC<React.HTMLAttributes<HTMLIonFooterElement>>;
  export const IonToolbar: React.FC<React.HTMLAttributes<HTMLIonToolbarElement>>;
  export const IonTitle: React.FC<React.HTMLAttributes<HTMLIonTitleElement>>;
  export const IonButtons: React.FC<React.HTMLAttributes<HTMLIonButtonsElement>>;
  export const IonButton: React.FC<React.HTMLAttributes<HTMLIonButtonElement>>;
  export const IonIcon: React.FC<{
    icon: string;
    size?: string;
    color?: string;
    ios?: string;
    md?: string;
  }>;
  
  // Navigation
  export const IonRouterOutlet: React.FC<React.HTMLAttributes<HTMLIonRouterOutletElement>>;
  export const IonTabs: React.FC<React.HTMLAttributes<HTMLIonTabsElement>>;
  export const IonTabBar: React.FC<React.HTMLAttributes<HTMLIonTabBarElement>>;
  export const IonTabButton: React.FC<React.HTMLAttributes<HTMLIonTabButtonElement>>;
  export const IonLabel: React.FC<React.HTMLAttributes<HTMLIonLabelElement>>;
  export const IonBackButton: React.FC<React.HTMLAttributes<HTMLIonBackButtonElement>>;
  
  // Form Components
  export const IonInput: React.FC<React.HTMLAttributes<HTMLIonInputElement>>;
  export const IonItem: React.FC<React.HTMLAttributes<HTMLIonItemElement>>;
  export const IonList: React.FC<React.HTMLAttributes<HTMLIonListElement>>;
  export const IonItemGroup: React.FC<React.HTMLAttributes<HTMLIonItemGroupElement>>;
  export const IonItemDivider: React.FC<React.HTMLAttributes<HTMLIonItemDividerElement>>;
  export const IonToggle: React.FC<React.HTMLAttributes<HTMLIonToggleElement>>;
  export const IonCheckbox: React.FC<React.HTMLAttributes<HTMLIonCheckboxElement>>;
  export const IonRadio: React.FC<React.HTMLAttributes<HTMLIonRadioElement>>;
  export const IonRadioGroup: React.FC<React.HTMLAttributes<HTMLIonRadioGroupElement>>;
  export const IonSelect: React.FC<React.HTMLAttributes<HTMLIonSelectElement>>;
  export const IonSelectOption: React.FC<React.HTMLAttributes<HTMLIonSelectOptionElement>>;
  
  // UI Components
  export const IonCard: React.FC<React.HTMLAttributes<HTMLIonCardElement>>;
  export const IonCardHeader: React.FC<React.HTMLAttributes<HTMLIonCardHeaderElement>>;
  export const IonCardTitle: React.FC<React.HTMLAttributes<HTMLIonCardTitleElement>>;
  export const IonCardSubtitle: React.FC<React.HTMLAttributes<HTMLIonCardSubtitleElement>>;
  export const IonCardContent: React.FC<React.HTMLAttributes<HTMLIonCardContentElement>>;
  export const IonAlert: React.FC<{
    isOpen: boolean;
    onDidDismiss: (event: CustomEvent) => void;
    header?: string;
    message?: string;
    buttons?: (string | {
      text: string;
      role?: string;
      handler?: () => void;
    })[];
  }>;
  export const IonLoading: React.FC<{
    isOpen: boolean;
    message?: string;
    onDidDismiss?: () => void;
    duration?: number;
  }>;
  export const IonToast: React.FC<{
    isOpen: boolean;
    message?: string;
    duration?: number;
    position?: 'top' | 'middle' | 'bottom';
    color?: string;
    onDidDismiss?: () => void;
  }>;
  
  // Hooks
  export function useIonViewWillEnter(callback: () => void, deps?: any[]): void;
  export function useIonViewDidEnter(callback: () => void, deps?: any[]): void;
  export function useIonViewWillLeave(callback: () => void, deps?: any[]): void;
  export function useIonViewDidLeave(callback: () => void, deps?: any[]): void;
  
  // Utils
  export function setupIonicReact(config?: {
    mode?: 'ios' | 'md';
    hardwareBackButton?: boolean;
    statusTap?: boolean;
  }): void;
  
  // Types
  export interface HTMLIonAppElement extends HTMLElement {}
  export interface HTMLIonPageElement extends HTMLElement {}
  export interface HTMLIonContentElement extends HTMLElement {}
  export interface HTMLIonHeaderElement extends HTMLElement {}
  export interface HTMLIonFooterElement extends HTMLElement {}
  export interface HTMLIonToolbarElement extends HTMLElement {}
  export interface HTMLIonTitleElement extends HTMLElement {}
  export interface HTMLIonButtonsElement extends HTMLElement {}
  export interface HTMLIonButtonElement extends HTMLElement {}
  export interface HTMLIonRouterOutletElement extends HTMLElement {}
  export interface HTMLIonTabsElement extends HTMLElement {}
  export interface HTMLIonTabBarElement extends HTMLElement {}
  export interface HTMLIonTabButtonElement extends HTMLElement {}
  export interface HTMLIonLabelElement extends HTMLElement {}
  export interface HTMLIonBackButtonElement extends HTMLElement {}
  export interface HTMLIonInputElement extends HTMLElement {}
  export interface HTMLIonItemElement extends HTMLElement {}
  export interface HTMLIonListElement extends HTMLElement {}
  export interface HTMLIonItemGroupElement extends HTMLElement {}
  export interface HTMLIonItemDividerElement extends HTMLElement {}
  export interface HTMLIonToggleElement extends HTMLElement {}
  export interface HTMLIonCheckboxElement extends HTMLElement {}
  export interface HTMLIonRadioElement extends HTMLElement {}
  export interface HTMLIonRadioGroupElement extends HTMLElement {}
  export interface HTMLIonSelectElement extends HTMLElement {}
  export interface HTMLIonSelectOptionElement extends HTMLElement {}
  export interface HTMLIonCardElement extends HTMLElement {}
  export interface HTMLIonCardHeaderElement extends HTMLElement {}
  export interface HTMLIonCardTitleElement extends HTMLElement {}
  export interface HTMLIonCardSubtitleElement extends HTMLElement {}
  export interface HTMLIonCardContentElement extends HTMLElement {}
  
  // Additional Ionic components can be added as needed
}
