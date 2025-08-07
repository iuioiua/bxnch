// deno-lint-ignore-file no-explicit-any
import { chart } from "fresh_charts/core.ts";

async function handler(request: Request): Promise<Response> {
  await request.body?.cancel();

  const url = new URL(request.url);
  if (url.pathname === "/") {
    return Response.redirect("https://github.com/iuioiua/bxnch");
  }

  if (url.pathname === "/favicon.ico") {
    return new Response("Not Found", { status: 404 });
  }

  if (request.method !== "GET") {
    return new Response("Not Found", { status: 405 });
  }

  const isDark = url.searchParams.get("dark") !== null;
  const rawFileUrl = url.toString().replace(
    url.origin,
    "https://raw.githubusercontent.com",
  );
  const response = await fetch(rawFileUrl);

  if (!response.ok) {
    return new Response(response.body, { ...response, headers: {} });
  }

  const bench = await response.json();

  let svg = chart({
    width: Number(url.searchParams.get("width") ?? "768"),
    height: Number(url.searchParams.get("height") ?? "384"),
    data: {
      labels: bench.benches.map(({ name }: any) => name),
      datasets: [{
        label: "Performance (avg. ns/iter)",
        data: bench.benches.map(({ results }: any) => results[0].ok.avg),
        backgroundColor: url.searchParams.get("color") ?? "lightblue",
      }],
    },
    options: {
      plugins: {
        subtitle: {
          display: true,
          text: `${bench.runtime} / ${bench.cpu}`,
          color: isDark ? "white" : undefined,
        },
        legend: {
          display: false,
        },
      },
      color: isDark ? "white" : undefined,
      scales: {
        y: {
          title: {
            display: true,
            text: "Performance (avg. ns/iter)",
            color: isDark ? "white" : undefined,
          },
          grid: {
            color: isDark ? "rgba(255,255,255,0.5)" : undefined,
          },
          ticks: {
            color: isDark ? "white" : undefined,
          },
          border: {
            color: isDark ? "rgba(255,255,255,0.5)" : undefined,
          },
        },
        x: {
          grid: {
            color: isDark ? "rgba(255,255,255,0.5)" : undefined,
          },
          ticks: {
            color: isDark ? "white" : undefined,
          },
          border: {
            color: isDark ? "rgba(255,255,255,0.5)" : undefined,
          },
        },
      },
    },
  });

  // Workaround to prevent title and subtitle from being stretched
  svg = svg.replace(/\s*textLength\s*=\s*"[^"]*"/g, "");

  return new Response(svg, {
    headers: { "content-type": "image/svg+xml" },
  });
}

export default {
  fetch: handler,
} as Deno.ServeDefaultExport;
