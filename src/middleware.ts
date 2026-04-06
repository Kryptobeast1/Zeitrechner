import { defineMiddleware } from 'astro:middleware';
import { ALL_TIME_RANGES } from './data/timeRanges';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.url);
  const pathname = url.pathname;

  // 1. Redirect /de/ to root (Legacy path)
  if (pathname.startsWith('/de/')) {
    const newPath = pathname.replace('/de/', '/');
    return context.redirect(newPath, 301);
  }

  // 2. Handle mixed language prefix/slug mismatches (GSC 404 Fixes)
  const isGermanWorkHours = pathname.startsWith('/arbeitsstunden-');
  const isGermanHoursBetween = pathname.startsWith('/stunden-zwischen-');
  const isEnglishWorkHours = pathname.startsWith('/en/work-hours-');
  const isEnglishHoursBetween = pathname.startsWith('/en/hours-between-');

  // Case A: German prefix with English slug
  if (isGermanWorkHours || isGermanHoursBetween) {
    const prefix = isGermanWorkHours ? '/arbeitsstunden-' : '/stunden-zwischen-';
    const slug = pathname.replace(prefix, '').replace(/\/$/, '');

    if (slug.includes('-and-')) {
      const match = ALL_TIME_RANGES.find(r => r.slug === slug);
      if (match) return context.redirect(`${prefix}${match.deSlug}/`, 301);
      return context.redirect(`${prefix}${slug.replace('-and-', '-und-')}/`, 301);
    }
  }

  // Case B: English prefix with German slug
  if (isEnglishWorkHours || isEnglishHoursBetween) {
    const prefix = isEnglishWorkHours ? '/en/work-hours-' : '/en/hours-between-';
    const slug = pathname.replace(prefix, '').replace(/\/$/, '');

    if (slug.includes('-und-')) {
      const match = ALL_TIME_RANGES.find(r => r.deSlug === slug);
      if (match) return context.redirect(`${prefix}${match.slug}/`, 301);
      return context.redirect(`${prefix}${slug.replace('-und-', '-and-')}/`, 301);
    }
  }

  return next();
});
