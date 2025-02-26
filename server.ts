// deno-lint-ignore-file no-explicit-any
import { renderChart } from "fresh_charts/render.ts";
import { STATUS_CODE, STATUS_TEXT } from "@std/http/status";

Deno.serve(async (request) => {
  if (request.method !== "GET") {
    const statusText = STATUS_TEXT[STATUS_CODE.NotFound];
    return new Response(statusText, {
      status: STATUS_CODE.NotFound,
      statusText,
    });
  }

  const url = new URL(request.url);
  if (url.pathname === "/") {
    return Response.redirect("https://github.com/iuioiua/bxnch");
  }

  if (url.pathname === "/favicon.ico") {
    const statusText = STATUS_TEXT[STATUS_CODE.NotFound];
    return new Response(statusText, {
      status: STATUS_CODE.NotFound,
      statusText,
    });
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

  return renderChart({
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
        title: {
          display: true,
          text: `${bench.runtime} / ${bench.cpu}`,
          fullSize: false,
          color: isDark ? "white" : undefined,
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
});
