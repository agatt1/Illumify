import {FilterMode, ColorblindnessType, ColorCorrectionType} from './generators/css-filter';
import { RGBA } from 'utils/color';

export interface ExtensionData {
    isEnabled: boolean;
    isReady: boolean;
    settings: UserSettings;
    fonts: string[];
    news: News[];
    shortcuts: Shortcuts;
    devDynamicThemeFixesText: string;
    devInversionFixesText: string;
    devStaticThemesText: string;
}

export interface ExtensionActions {
    changeSettings(settings: Partial<UserSettings>);
    setTheme(theme: Partial<FilterConfig>);
    setShortcut(command: string, shortcut: string);
    toggleSitePattern(pattern: string);
    markNewsAsRead(ids: string[]);
    applyDevDynamicThemeFixes(text: string): Promise<void>;
    resetDevDynamicThemeFixes();
    applyDevInversionFixes(text: string): Promise<void>;
    resetDevInversionFixes();
    applyDevStaticThemes(text: string): Promise<void>;
    resetDevStaticThemes();
}

export interface ExtWrapper {
    data: ExtensionData;
    actions: ExtensionActions;
}

export interface FilterConfig {
    mode: FilterMode;
    brightness: number;
    contrast: number;
    grayscale: number;
    sepia: number;
    useFont: boolean;
    fontFamily: string;
    textStroke: number;
    textScale: number;
    useColorCorrection: boolean;
    colorblindnessType: ColorblindnessType;
    colorblindnessSensitivity: number;
    colorCorrectionType: ColorCorrectionType;
    linkColor: boolean;
    unclickedColor: string;
    clickedColor: string;
    engine: string;
    stylesheet: string;
    dummy_val: number;
}

export interface CustomSiteConfig {
    url: string[];
    theme: FilterConfig;
}

export interface UserSettings {
    enabled: boolean | 'auto';
    theme: FilterConfig;
    customThemes: CustomSiteConfig[];
    siteList: string[];
    applyToListedOnly: boolean;
    changeBrowserTheme: boolean;
    activationTime: string;
    deactivationTime: string;
    notifyOfNews: boolean;
    syncSettings: boolean;
}

export interface TabInfo {
    url: string;
    isProtected: boolean;
    isInDarkList: boolean;
}

export interface Message {
    type: string;
    data?: any;
    id?: any;
    error?: any;
}

export interface Shortcuts {
    [name: string]: string;
}

export interface DynamicThemeFix {
    url: string[];
    invert?: string[];
}

export interface InversionFix {
    url: string[];
    invert: string[];
    noinvert: string[];
    removebg: string[];
    css: string;
}

export interface StaticTheme {
    url: string[];
    neutralBg?: string[];
    neutralBgActive?: string[];
    neutralText?: string[];
    neutralTextActive?: string[];
    neutralBorder?: string[];
    redBg?: string[];
    redBgActive?: string[];
    redText?: string[];
    redTextActive?: string[];
    redBorder?: string[];
    greenBg?: string[];
    greenBgActive?: string[];
    greenText?: string[];
    greenTextActive?: string[];
    greenBorder?: string[];
    blueBg?: string[];
    blueBgActive?: string[];
    blueText?: string[];
    blueTextActive?: string[];
    blueBorder?: string[];
    fadeBg?: string[];
    fadeText?: string[];
    transparentBg?: string[];
    noImage?: string[];
    invert?: string[];
    noCommon?: boolean;
}

export interface News {
    id: string;
    date: string;
    url: string;
    headline: string;
    read?: boolean;
}
