// uniezz.pl pages the app opens itself (universal / app links), by their web path prefix; the id after
// the prefix becomes the app route's [id]. Keep in step with the web AASA file and app.json intentFilters,
// whose Android pathAdvancedPattern takes only a uuid after the prefix, so edit and new forms stay on the
// web. shortcut: Android 11 and older ignore pathAdvancedPattern and open these links on the web
export const WEB_LINK_ROUTES = [
  ["/feed/post/", "/post"],
  ["/connections/students/", "/student"],
  ["/exams/courses/", "/course"],
] as const;
