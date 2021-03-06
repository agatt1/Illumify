import {iterateCSSDeclarations} from './css-rules';
import {getModifiableCSSDeclaration, ModifiableCSSDeclaration} from './modify-css';
import {FilterConfig} from '../../definitions';

interface Overrides {
    [cssProp: string]: {
        customProp: string;
        cssProp: string;
        dataAttr: string;
        store: WeakSet<Node>;
    };
}

const overrides: Overrides = {
    'background-color': {
        customProp: '--darkreader-inline-bgcolor',
        cssProp: 'background-color',
        dataAttr: 'data-darkreader-inline-bgcolor',
        store: new WeakSet(),
    },
    'background-image': {
        customProp: '--darkreader-inline-bgimage',
        cssProp: 'background-image',
        dataAttr: 'data-darkreader-inline-bgimage',
        store: new WeakSet(),
    },
    'border-color': {
        customProp: '--darkreader-inline-border',
        cssProp: 'border-color',
        dataAttr: 'data-darkreader-inline-border',
        store: new WeakSet(),
    },
    'border-bottom-color': {
        customProp: '--darkreader-inline-border-bottom',
        cssProp: 'border-bottom-color',
        dataAttr: 'data-darkreader-inline-border-bottom',
        store: new WeakSet(),
    },
    'border-left-color': {
        customProp: '--darkreader-inline-border-left',
        cssProp: 'border-left-color',
        dataAttr: 'data-darkreader-inline-border-left',
        store: new WeakSet(),
    },
    'border-right-color': {
        customProp: '--darkreader-inline-border-right',
        cssProp: 'border-right-color',
        dataAttr: 'data-darkreader-inline-border-right',
        store: new WeakSet(),
    },
    'border-top-color': {
        customProp: '--darkreader-inline-border-top',
        cssProp: 'border-top-color',
        dataAttr: 'data-darkreader-inline-border-top',
        store: new WeakSet(),
    },
    'box-shadow': {
        customProp: '--darkreader-inline-boxshadow',
        cssProp: 'box-shadow',
        dataAttr: 'data-darkreader-inline-boxshadow',
        store: new WeakSet(),
    },
    'color': {
        customProp: '--darkreader-inline-color',
        cssProp: 'color',
        dataAttr: 'data-darkreader-inline-color',
        store: new WeakSet(),
    },
    'fill': {
        customProp: '--darkreader-inline-fill',
        cssProp: 'fill',
        dataAttr: 'data-darkreader-inline-fill',
        store: new WeakSet(),
    },
    'stroke': {
        customProp: '--darkreader-inline-stroke',
        cssProp: 'stroke',
        dataAttr: 'data-darkreader-inline-stroke',
        store: new WeakSet(),
    },
    'outline-color': {
        customProp: '--darkreader-inline-outline',
        cssProp: 'outline-color',
        dataAttr: 'data-darkreader-inline-outline',
        store: new WeakSet(),
    },
};

const overridesList = Object.values(overrides);

const INLINE_STYLE_ATTRS = ['style', 'fill', 'stroke', 'bgcolor', 'color'];
const INLINE_STYLE_SELECTOR = INLINE_STYLE_ATTRS.map((attr) => `[${attr}]`).join(', ');

export function getInlineOverrideStyle() {
    return overridesList.map(({dataAttr, customProp, cssProp}) => {
        return [
            `[${dataAttr}] {`,
            `  ${cssProp}: var(${customProp}) !important;`,
            '}',
        ].join('\n');
    }).join('\n');
}

const inlineStyleElements = new WeakSet<Node>();
let observer: MutationObserver = null;

export function overrideInlineStyles(filter: FilterConfig) {
    const elements = Array.from(document.querySelectorAll(INLINE_STYLE_SELECTOR));
    elements.forEach((el) => elementDidUpdate(el as HTMLElement, filter));
}

function expand(nodes: Node[], selector: string) {
    const results: Node[] = [];
    nodes.forEach((n) => {
        if (n instanceof Element) {
            if (n.matches(selector)) {
                results.push(n);
            }
            results.push(...Array.from(n.querySelectorAll(selector)));
        }
    });
    return results;
}

export function watchForInlineStyles(filter: FilterConfig) {
    if (observer) {
        observer.disconnect();
    }
    observer = new MutationObserver((mutations) => {
        mutations.forEach((m) => {
            const createdInlineStyles = expand(Array.from(m.addedNodes), INLINE_STYLE_SELECTOR);
            if (createdInlineStyles.length > 0) {
                createdInlineStyles.forEach((el) => elementDidUpdate(el as HTMLElement, filter));
            }
            if (m.type === 'attributes') {
                if (INLINE_STYLE_ATTRS.indexOf(m.attributeName) >= 0) {
                    elementDidUpdate(m.target as HTMLElement, filter);
                }
                overridesList
                    .filter(({store, dataAttr}) => store.has(m.target) && !(m.target as HTMLElement).hasAttribute(dataAttr))
                    .forEach(({dataAttr}) => (m.target as HTMLElement).setAttribute(dataAttr, ''));
            }
        });
    });
    observer.observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: INLINE_STYLE_ATTRS.concat(overridesList.map(({dataAttr}) => dataAttr)),
    });
}

const elementsChangeKeys = new WeakMap<Element, string>();
const filterProps = ['brightness', 'contrast', 'grayscale', 'sepia', 'mode', 'useColorCorrection', 'colorblindnessType', 'colorblindnessSensitivity', 'colorCorrectionType'];

function getElementChangeKey(el: Element, filter: FilterConfig) {
    return INLINE_STYLE_ATTRS
        .map((attr) => `${attr}="${el.getAttribute(attr)}"`)
        .concat(filterProps.map((prop) => `${prop}="${filter[prop]}"`))
        .join(' ');
}

export function stopWatchingForInlineStyles() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
}

function elementDidUpdate(element: HTMLElement, filter: FilterConfig) {
    console.log("elementDidUpdate");
    if (elementsChangeKeys.get(element) === getElementChangeKey(element, filter)) {
        return;
    }
    overrideInlineStyle(element, filter);
}

function overrideInlineStyle(element: HTMLElement, filter: FilterConfig) {

    const unsetProps = new Set(Object.keys(overrides));

    function setCustomProp(targetCSSProp: string, modifierCSSProp: string, cssVal: string) {
        const {customProp, dataAttr, store} = overrides[targetCSSProp];

        const mod = getModifiableCSSDeclaration(modifierCSSProp, cssVal, null, null);
        if (!mod) {
            return;
        }
        let value = mod.value;
        if (typeof value === 'function') {
            value = value(filter) as string;
        }
        element.style.setProperty(customProp, value as string);
        if (!element.hasAttribute(dataAttr)) {
            element.setAttribute(dataAttr, '');
        }
        unsetProps.delete(targetCSSProp);
    }

    if (element.hasAttribute('bgcolor')) {
        let value = element.getAttribute('bgcolor');
        if (value.match(/^[0-9a-f]{3}$/i) || value.match(/^[0-9a-f]{6}$/i)) {
            value = `#${value}`;
        }
        setCustomProp('background-color', 'background-color', value);
    }
    if (element.hasAttribute('color')) {
        let value = element.getAttribute('color');
        if (value.match(/^[0-9a-f]{3}$/i) || value.match(/^[0-9a-f]{6}$/i)) {
            value = `#${value}`;
        }
        setCustomProp('color', 'color', value);
    }
    if (element.hasAttribute('fill') && element instanceof SVGElement) {
        const SMALL_SVG_LIMIT = 32;
        let value = element.getAttribute('fill');
        let isBg = false;
        if (!(element instanceof SVGTextElement)) {
            const {width, height} = element.getBoundingClientRect();
            isBg = (width > SMALL_SVG_LIMIT || height > SMALL_SVG_LIMIT);
        }
        setCustomProp('fill', isBg ? 'background-color' : 'color', value);
    }
    if (element.hasAttribute('stroke')) {
        let value = element.getAttribute('stroke');
        setCustomProp('stroke', element instanceof SVGLineElement || element instanceof SVGTextElement ? 'border-color' : 'color', value);
    }
    element.style && iterateCSSDeclarations(element.style, (property, value) => {
        // Temporaty ignore background images
        // due to possible performance issues
        // and complexity of handling async requests
        if (property === 'background-image' && value.indexOf('url') >= 0) {
            return;
        }
        if (overrides.hasOwnProperty(property)) {
            setCustomProp(property, property, value);
        }
    });
    if (element.style && element instanceof SVGTextElement && element.style.fill) {
        setCustomProp('fill', 'color', element.style.getPropertyValue('fill'));
    }
    Array.from(unsetProps).forEach((cssProp) => {
        const {store, dataAttr} = overrides[cssProp];
        store.delete(element);
        element.removeAttribute(dataAttr);
    });
    elementsChangeKeys.set(element, getElementChangeKey(element, filter));
}
