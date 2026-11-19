// O site repete números e links em várias páginas. Estes testes garantem que o texto não
// desencontra da fonte (src/lib/conteudo.ts) e que nenhum link interno aponta para o nada.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import * as conteudo from "../lib/conteudo";
import { ESPECIALIDADES, PERGUNTAS, PRECO } from "../lib/conteudo";

const SRC = join(__dirname, "..");
const APP = join(SRC, "app");

function arquivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return arquivos(p);
    return /\.(tsx?|mdx?)$/.test(n) && !n.endsWith(".test.ts") ? [p] : [];
  });
}
const fontes = arquivos(SRC).map((p) => ({ p, texto: readFileSync(p, "utf8") }));
const tudo = fontes.map((f) => f.texto).join("\n") + PERGUNTAS.map((q) => q.r).join("\n");

function numerosAntesDe(palavra: RegExp): number[] {
  return [...tudo.matchAll(new RegExp(String.raw`(\d+)\s+` + palavra.source, "g"))].map((m) => Number(m[1]));
}

describe("números do site batem com src/lib/conteudo.ts", () => {
  test("dias grátis", () => {
    const achados = numerosAntesDe(/dias grátis/);
    expect(achados.length).toBeGreaterThan(0);
    expect(new Set(achados)).toEqual(new Set([PRECO.testeDias]));
  });

  test("especialidades", () => {
    const achados = numerosAntesDe(/especialidades/);
    expect(achados.length).toBeGreaterThan(0);
    expect(new Set(achados)).toEqual(new Set([ESPECIALIDADES.length]));
    expect(new Set(ESPECIALIDADES).size).toBe(ESPECIALIDADES.length);
  });

  test("total do plano anual é 12 vezes a mensalidade do anual", () => {
    const total = Number(PRECO.anual) * 12;
    expect(PRECO.anualTotal).toBe(`${total.toLocaleString("pt-BR")},${PRECO.anualCentavos}`);
  });

  test("todas as perguntas têm resposta", () => {
    for (const q of PERGUNTAS) expect(q.r.trim().length, q.p).toBeGreaterThan(20);
  });
});

describe("links", () => {
  test("os links externos de conteudo.ts são https", () => {
    for (const [nome, v] of Object.entries(conteudo)) {
      if (typeof v === "string" && /^[a-z]+:/.test(v)) expect(v, nome).toMatch(/^https:\/\//);
    }
  });

  test("todo link interno leva a uma página que existe, e a âncora existe nela", () => {
    const internos = [...tudo.matchAll(/href=["{]?"?(\/[a-z0-9/-]*)(#[a-z0-9-]+)?"/g)];
    expect(internos.length).toBeGreaterThan(0);
    for (const [, caminho, ancora] of internos) {
      const pasta = join(APP, caminho.replace(/^\/|\/$/g, ""));
      const pagina = join(pasta, "page.tsx");
      expect(existsSync(pagina), `${caminho} não tem página`).toBe(true);
      if (ancora) {
        const id = ancora.slice(1);
        const daPagina = fontes.filter((f) => f.p === pagina || f.p.includes("/components/"));
        expect(daPagina.some((f) => f.texto.includes(`id="${id}"`)), `${caminho}${ancora} sem âncora`).toBe(true);
      }
    }
  });
});
