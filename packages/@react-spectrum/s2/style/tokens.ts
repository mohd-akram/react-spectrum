/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// package.json in this directory is not the real package.json. Lint rule not smart enough.
// eslint-disable-next-line rulesdir/imports
import * as tokens from '@adobe/spectrum-tokens/dist/json/variables.json';

export function getToken(name: keyof typeof tokens): string {
  return (tokens[name] as any).value;
}

export interface ColorToken {
  type: 'color',
  light: string,
  dark: string,
  forcedColors?: string
}

export function colorToken(name: keyof typeof tokens): ColorToken | ColorRef {
  let token = tokens[name] as typeof tokens['gray-25'] | typeof tokens['neutral-content-color-default'];
  if ('ref' in token) {
    return {
      type: 'ref',
      light: token.ref.slice(1, -1).replace('-color', ''),
      dark: token.ref.slice(1, -1).replace('-color', '')
    };
  }

  return {
    type: 'color',
    light: token.sets.light.value,
    dark: token.sets.dark.value
  };
}

export function rawColorToken(name: keyof typeof tokens): string {
  let token = tokens[name] as typeof tokens['gray-25'];
  return `light-dark(${token.sets.light.value}, ${token.sets.dark.value})`;
}

export interface ColorRef {
  type: 'ref',
  light: string,
  dark: string,
  forcedColors?: string
}

export function weirdColorToken(name: keyof typeof tokens): ColorRef {
  let token = tokens[name] as typeof tokens['accent-background-color-default'];
  return {
    type: 'ref',
    light: token.sets.light.ref.slice(1, -1).replace('-color', ''),
    dark: token.sets.dark.ref.slice(1, -1).replace('-color', '')
  };
}

type ReplaceColor<S extends string> = S extends `${infer S}-color-${infer N}` ? `${S}-${N}` : S;

export function colorScale<S extends string>(scale: S): Record<ReplaceColor<Extract<keyof typeof tokens, `${S}-${number}`>>, ReturnType<typeof colorToken>> {
  let res: any = {};
  let re = new RegExp(`^${scale}-\\d+$`);
  for (let token in tokens) {
    if (re.test(token)) {
      res[token.replace('-color', '')] = colorToken(token as keyof typeof tokens);
    }
  }
  return res;
}

export function simpleColorScale<S extends string>(scale: S): Record<Extract<keyof typeof tokens, `${S}-${number}`>, string> {
  let res: any = {};
  let re = new RegExp(`^${scale}-\\d+$`);
  for (let token in tokens) {
    if (re.test(token)) {
      res[token] = (tokens as any)[token].value;
    }
  }
  return res;
}

function extractOpacity(color: string): number {
  return Number(color.match(/^rgba\(\d+, \d+, \d+, ([.\d]+)\)$/)?.[1] ?? 1);
}

/**
 * This swaps between white or black based on the background color.
 * After testing against all RGB background colors, 49.44 minimizes the number of WCAG 4.5:1 contrast failures.
 */
export function autoStaticColor(bg = 'var(--s2-container-bg)', alpha = 1): string {
  return `lch(from ${bg} calc((49.44 - l) * infinity) 0 0 / ${alpha})`;
}

interface ColorScaleValues {
    'transparent-overlay-25': string,
    'transparent-overlay-50': string,
    'transparent-overlay-75': string,
    'transparent-overlay-100': string,
    'transparent-overlay-200': string,
    'transparent-overlay-300': string,
    'transparent-overlay-400': string,
    'transparent-overlay-500': string,
    'transparent-overlay-600': string,
    'transparent-overlay-700': string,
    'transparent-overlay-800': string,
    'transparent-overlay-900': string,
    'transparent-overlay-1000': string
}

export function generateOverlayColorScale(bg = 'var(--s2-container-bg)'): ColorScaleValues {
  return {
    'transparent-overlay-25': autoStaticColor(bg, extractOpacity(getToken('transparent-white-25'))),
    'transparent-overlay-50': autoStaticColor(bg, extractOpacity(getToken('transparent-white-50'))),
    'transparent-overlay-75': autoStaticColor(bg, extractOpacity(getToken('transparent-white-75'))),
    'transparent-overlay-100': autoStaticColor(bg, extractOpacity(getToken('transparent-white-100'))),
    'transparent-overlay-200': autoStaticColor(bg, extractOpacity(getToken('transparent-white-200'))),
    'transparent-overlay-300': autoStaticColor(bg, extractOpacity(getToken('transparent-white-300'))),
    'transparent-overlay-400': autoStaticColor(bg, extractOpacity(getToken('transparent-white-400'))),
    'transparent-overlay-500': autoStaticColor(bg, extractOpacity(getToken('transparent-white-500'))),
    'transparent-overlay-600': autoStaticColor(bg, extractOpacity(getToken('transparent-white-600'))),
    'transparent-overlay-700': autoStaticColor(bg, extractOpacity(getToken('transparent-white-700'))),
    'transparent-overlay-800': autoStaticColor(bg, extractOpacity(getToken('transparent-white-800'))),
    'transparent-overlay-900': autoStaticColor(bg, extractOpacity(getToken('transparent-white-900'))),
    'transparent-overlay-1000': autoStaticColor(bg, extractOpacity(getToken('transparent-white-1000')))
  };
}

const indexes = {
  'font-size-25': -3,
  'font-size-50': -2,
  'font-size-75': -1,
  'font-size-100': 0,
  'font-size-200': 1,
  'font-size-300': 2,
  'font-size-400': 3,
  'font-size-500': 4,
  'font-size-600': 5,
  'font-size-700': 6,
  'font-size-800': 7,
  'font-size-900': 8,
  'font-size-1000': 9,
  'font-size-1100': 10,
  'font-size-1200': 11,
  'font-size-1300': 12,
  'font-size-1400': 13,
  'font-size-1500': 14
};

/** Returns the index of a font token relative to font-size-100 (which is index 0). */
export function fontSizeToken(name: keyof typeof tokens): number {
  let token = tokens[name] as typeof tokens['font-size-100'] | typeof tokens['heading-size-m'];
  if ('ref' in token) {
    name = token.ref.slice(1, -1) as keyof typeof tokens;
  }

  let index = indexes[name];
  if (index == null) {
    throw new Error('Unknown font size ' + name);
  }

  return index;
}
