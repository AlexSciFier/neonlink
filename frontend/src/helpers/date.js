function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return { value: Math.round(elapsed / 1000), format: "seconds" };
  } else if (elapsed < msPerHour) {
    return { value: Math.round(elapsed / msPerMinute), format: "minutes" };
  } else if (elapsed < msPerDay) {
    return { value: Math.round(elapsed / msPerHour), format: "hours" };
  } else if (elapsed < msPerMonth) {
    return { value: Math.round(elapsed / msPerDay), format: "days" };
  } else if (elapsed < msPerYear) {
    return { value: Math.round(elapsed / msPerMonth), format: "months" };
  } else {
    return { value: Math.round(elapsed / msPerYear), format: "years" };
  }
}

export function parseDate(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return new Date(value);
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value))
    return new Date(value.replace(" ", "T") + "Z");
  return new Date(value);
}

export function prettyfyDate(dateString) {
  let rtf = new Intl.RelativeTimeFormat("en", {
    localeMatcher: "best fit",
    numeric: "auto",
    style: "long",
  });
  let date = parseDate(dateString);
  if (!date || isNaN(date.getTime())) return "";
  let diff = timeDifference(Date.now(), date);
  if (diff.format === "years")
    return date.toLocaleString([], {
      dateStyle: "long",
    });
  return rtf.format(-diff.value, diff.format);
}
