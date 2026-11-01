/**
 * We have CSS in JS files so that they can be used in web components.
 */

import { css } from 'rend'

export async function onRequestGet(c) {
  return new Response(root({}), {
    headers: {
      'content-type': 'text/css;charset=UTF-8',
    },
  })
}

export function root(d) {
  return css`
    body {
      min-height: 100vh;
    }

    .topnav {
      padding: 16px;
    }

    .topnav a {
      text-decoration: none;
    }

    ${all(d)}
  `
}

export function all(d?: any) {
  return css`
    .success {
      color: var(--bs-success);
    }

    .error {
      color: var(--bs-danger);
    }

    .flex {
      display: flex;
    }

    .flexw {
      display: flex;
      flex-wrap: wrap;
    }

    .grid {
      display: grid;
    }

    .fcol {
      flex-direction: column;
    }

    .jcc {
      justify-content: center;
    }

    .jcsb {
      justify-content: space-between;
    }

    .jce {
      justify-content: end;
    }

    .aic {
      align-items: center;
    }

    .g8 {
      gap: 8px;
    }

    .g12 {
      gap: 12px;
    }

    .g16 {
      gap: 16px;
    }

    .g20 {
      gap: 20px;
    }

    .g24 {
      gap: 24px;
    }
    .g32 {
      gap: 32px;
    }

    .p16 {
      padding: 16px;
    }
    .p20 {
      padding: 20px;
    }
    .p24 {
      padding: 24px;
    }

    .pt12 {
      padding-top: 12px;
    }

    .mt8 {
      margin-top: 8px;
    }

    .mt12 {
      margin-top: 12px;
    }

    .mt20 {
      margin-top: 20px;
    }

    .mb16 {
      margin-bottom: 16px;
    }

    .mb20 {
      margin-bottom: 20px;
    }

    .mb24 {
      margin-bottom: 24px;
    }

    .tac {
      text-align: center;
    }

    .w100 {
      width: 100%;
    }

    ${typography()}
  `
}

function typography() {
  return css`
    .headline-medium {
      font-weight: 400;
      font-size: 28px;
      line-height: 36px;
    }

    .title-medium {
      font-size: 16px;
      font-weight: 500;
      letter-spacing: 0.15px;
      line-height: 24px;
    }

    .title-large {
      font-size: 22px;
      font-weight: 400;
      letter-spacing: 0px;
      line-height: 28px;
    }
  `
}
