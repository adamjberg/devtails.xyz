---
layout: post
title: 2026 Engram Commit Analysis
author: adam
permalink: /2026-engram-commit-analysis
description:
image:
tags: dev engram
---

This covers **853 files** and **121,000 lines of code**, from **23 Dec 2025** through **30 Sep 2026**.

## Commits per day

<div class="commit-chart"><canvas id="commits-per-day"></canvas></div>

## Weekly lines per commit

<div class="commit-chart"><canvas id="weekly-lines"></canvas></div>

## Monthly diffs

<div class="commit-chart"><canvas id="monthly-diffs"></canvas></div>

## Weekday commits

<div class="commit-chart"><canvas id="weekday-commits"></canvas></div>

## Hour of day

<div class="commit-chart"><canvas id="hour-of-day"></canvas></div>

## Commits per working day

<div class="commit-chart"><canvas id="working-day-histogram"></canvas></div>

## Commit size

<div class="commit-chart"><canvas id="commit-size-histogram"></canvas></div>

<style>
.commit-chart { position: relative; height: 280px; margin: 1rem 0 2rem; }
</style>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
<script type="module">
const DATA = "/2026-engram-commit-analysis/git-activity";
const COLOR = "#2a7ae2";

function parseCsv({ text }) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  const headers = rows[0];
  return rows.slice(1).filter((cols) => cols.length === headers.length && cols.some(Boolean)).map((cols) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = cols[index];
    });
    return record;
  });
}

async function loadCsv({ name }) {
  const response = await fetch(`${DATA}/${name}`);
  return parseCsv({ text: await response.text() });
}

function barChart({ id, labels, values, xTitle, yTitle }) {
  const canvas = document.getElementById(id);
  new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: COLOR, borderWidth: 0 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: Boolean(xTitle), text: xTitle } },
        y: { beginAtZero: true, title: { display: Boolean(yTitle), text: yTitle }, ticks: { precision: 0 } },
      },
    },
  });
}

function lineChart({ id, labels, values, yTitle }) {
  const canvas = document.getElementById(id);
  new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{ data: values, borderColor: COLOR, backgroundColor: COLOR, pointRadius: 0, tension: 0.15 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { maxTicksLimit: 8 } },
        y: { beginAtZero: true, title: { display: Boolean(yTitle), text: yTitle } },
      },
    },
  });
}

function monthlyDiffs({ daily }) {
  const totals = new Map();
  for (const row of daily) {
    const month = row.date.slice(0, 7);
    totals.set(month, (totals.get(month) ?? 0) + Number(row.diff_size));
  }
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return [...totals.entries()].map(([month, diff]) => {
    const [year, monthIndex] = month.split("-");
    return { label: `${names[Number(monthIndex) - 1]} ${year}`, diff };
  });
}

function histogram({ values, width }) {
  const max = Math.max(...values);
  const bins = [];
  for (let start = 1; start <= max; start += width) {
    const end = Math.min(start + width - 1, max);
    bins.push({
      label: `${start}–${end}`,
      count: values.filter((value) => value >= start && value <= end).length,
    });
  }
  return bins;
}

const SIZE_BINS = [
  { label: "1–10", min: 1, max: 10 },
  { label: "11–25", min: 11, max: 25 },
  { label: "26–50", min: 26, max: 50 },
  { label: "51–100", min: 51, max: 100 },
  { label: "101–250", min: 101, max: 250 },
  { label: "251–500", min: 251, max: 500 },
  { label: "501–1k", min: 501, max: 1000 },
  { label: "1k–5k", min: 1001, max: 5000 },
  { label: "5k+", min: 5001, max: Infinity },
];

const daily = await loadCsv({ name: "daily.csv" });
const weekly = await loadCsv({ name: "weekly.csv" });
const weekday = await loadCsv({ name: "weekday.csv" });
const hours = await loadCsv({ name: "hour_of_day.csv" });
const commits = await loadCsv({ name: "commits.csv" });

lineChart({
  id: "commits-per-day",
  labels: daily.map((row) => row.date),
  values: daily.map((row) => Number(row.commits)),
  yTitle: "Commits",
});

lineChart({
  id: "weekly-lines",
  labels: weekly.map((row) => row.week),
  values: weekly.map((row) => Number(row.avg_diff_per_commit)),
  yTitle: "Avg lines changed",
});

const months = monthlyDiffs({ daily });
barChart({
  id: "monthly-diffs",
  labels: months.map((month) => month.label),
  values: months.map((month) => month.diff),
  yTitle: "Lines changed",
});

barChart({
  id: "weekday-commits",
  labels: weekday.map((row) => row.weekday_name),
  values: weekday.map((row) => Number(row.commits)),
  yTitle: "Commits",
});

barChart({
  id: "hour-of-day",
  labels: hours.map((row) => row.hour),
  values: hours.map((row) => Number(row.commits)),
  xTitle: "Hour",
  yTitle: "Commits",
});

const workingDayBins = histogram({
  values: daily.map((row) => Number(row.commits)).filter((count) => count > 0),
  width: 10,
});
barChart({
  id: "working-day-histogram",
  labels: workingDayBins.map((bin) => bin.label),
  values: workingDayBins.map((bin) => bin.count),
  xTitle: "Commits that day",
  yTitle: "Days",
});

const sizes = commits.map((row) => Number(row.diff_size));
barChart({
  id: "commit-size-histogram",
  labels: SIZE_BINS.map((bin) => bin.label),
  values: SIZE_BINS.map((bin) => sizes.filter((size) => size >= bin.min && size <= bin.max).length),
  xTitle: "Lines changed",
  yTitle: "Commits",
});
</script>
