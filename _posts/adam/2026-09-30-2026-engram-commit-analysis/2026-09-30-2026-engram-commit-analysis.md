---
layout: post
title: 2026 Engram Commit Analysis
author: adam
permalink: /2026-engram-commit-analysis
description:
image:
tags: dev engram
---

I was lucky to start 2026 with pretty much a brand new code repository for (the current iteration of) engram.  It began as an experiment as to whether coding agents could write all of the code.

It's not in the charts below, but ~90% of my commits were 100% authored by AI agents. Anecdotally, the commits where I didn't use AI were usually small fixes that involved less typing than prompting the AI to make the change.  Granted there were many times it would have been faster to write the code change, but I used an agent because it also handled committing the code with a nice message.

The software world is changing dramatically.  I needed a real web application to learn and capture how I used agents in real circumstances.

As I take a [step back from commercializing the software](https://www.instagram.com/p/DdosLKomw-T), I'm better able to reflect on this whole experience.

The timing of this seems important as it feels like we are approaching the plateau of productivity.

<img 
  src="/2026-engram-commit-analysis/gartner-hype-cycle.png" 
  alt="Gartner Hype Cycle illustrating the phases of technology adoption" 
  style="max-width: 100%; height: auto; display: block; margin: 1.5rem auto;"
/>

While there are certain prompts I write that cause my agent to go off the rails, as long as I rewrite my prompt I'm basically able to achieve my goals 100% of the time from just a prompt.

I still believe there are some pretty major improvements to come in the near future, but the radical shift if from writing code to writing prompts.

There are people now hyping up Loops and parallelizing use of agents.  I can see the potential value here and am open to it, but if I reflect on my ideal usage of coding agents I always come back to wanting to sit in the pilot seat synchronously working with an agent.

Loops and parallelizing agents seems like a intermediate solution to the fact that our agents have ballooned in time to complete task.

Don't get me wrong, they are absolutely solving more complex problems more consistently.

However, there is a limit to this.  Meanwhile, we have Cerebras proving that >1500 tokens / second (roughly 8 times faster than most current models).  And [Taalas](https://taalas.com/), recently acquired by AMD, demonstrating that 17,000 tokens per second is theoretically possible (>100x faster than current frontier models).

My belief and goal is to be able to write my prompt and have an immediate response from my coding assistant.  Ignoring more complex long horizon tasks, right now a small task is about 30 seconds, medium is 60s, large 120s.

At 100x speedup, these durations drop to under 1 second, becoming instantaneous.

**This speedup is inevitable.**

I don't know when it happens, but it is obvious that we will be able to achieve it.

This post is a starting look at my output metrics through the lens of git commits.  From the beginning of the process, a single prompt to accepted solution generally correlates with a single commit.

I wanted a better understanding of my own pace, how many lines of code were truly achievable while working on a real web application.

The current codebase is **853 files** and **121,000 lines of code** (excluding one off scripts and other code unrelated to core application) and this data is from the first commit on **23 Dec 2025** through today **30 Sep 2026**.

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
