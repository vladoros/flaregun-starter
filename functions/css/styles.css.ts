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
    .green,
    .success {
      color: var(--bs-success);
    }

    .red,
    .error {
      color: var(--bs-danger);
    }

    .flex {
      display: flex;
    }

    .flexr {
      display: flex;
    }

    .flexw {
      display: flex;
      flex-wrap: wrap;
    }

    .grid {
      display: grid;
    }

    /* Medium window breakpoint */
    @media (width < 840px) {
      .flexr {
        flex-direction: column;
      }

      .mobOrder1 {
        order: -100;
      }

      .mobOrder2 {
        order: -50;
      }

      .mobOrder3 {
        order: -20;
      }

      .lteMedium {
        display: block;
      }

      .gtMedium {
        /* aka expanded */
        display: none;
      }
    }

    @media (width >=840px) {
      .gtMedium {
        display: block;
      }

      .lteMedium {
        display: none;
      }
    }

    .frow {
      flex-direction: row;
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

    .jcse {
      justify-content: space-evenly;
    }

    .jce {
      justify-content: end;
    }

    .aic {
      align-items: center;
    }

    .rc4 {
      border-radius: 4px;
    }

    .a2 {
      text-decoration: none;
      color: white;
    }

    /* .a2:hover {
    text-decoration: underline;
  } */

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

    .p4 {
      padding: 4px;
    }
    .p8 {
      padding: 8px;
    }
    .p12 {
      padding: 12px;
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
    .pt40 {
      padding-top: 40px;
    }

    .pb40 {
      padding-bottom: 40px;
    }

    .mt8 {
      margin-top: 8px;
    }

    .mt12 {
      margin-top: 12px;
    }

    .mt16 {
      margin-top: 16px;
    }

    .mt20 {
      margin-top: 20px;
    }

    .mt24 {
      margin-top: 24px;
    }
    .mt32 {
      margin-top: 32px;
    }
    .mt48 {
      margin-top: 48px;
    }

    .mb8 {
      margin-bottom: 8px;
    }

    .mb12 {
      margin-bottom: 12px;
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

    .br4 {
      border-radius: 4px;
    }

    .br8 {
      border-radius: 8px;
    }
    .br50 {
      border-radius: 50%;
    }
    .wh36 {
      height: 36px;
      width: 36px;
    }

    ${typography()}
  `
}

function typography() {
  return css`
    .display-medium {
      font-weight: 400;
      font-size: 45px;
      line-height: 52px;
    }

    .headline-small {
      font-weight: 400;
      font-size: 24px;
      line-height: 32px;
    }
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
