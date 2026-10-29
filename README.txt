BoldStitch website
==================

Open it through a local web server (double-clicking index.html can block images/videos):

    cd "D:\harshit\bold stitch\website"
    python -m http.server 8080

then visit http://localhost:8080

Pages
  samples.html   Compare the three design samples side by side
  sample-1.html  Classic   — centred logo hero, custom order button in the hero, black/gold marquee
  sample-2.html  Editorial — split headline hero, custom order in the nav bar, gold/black marquee
  sample-3.html  Minimal   — centred-logo nav, script hero, custom order band in the footer, burgundy marquee
  index.html     Main homepage (Sample 1 · Classic)
  index-old.html Previous version (kept for reference)
  login.html   Sign in / Create account / Forgot password / Signed-in / Logged-out screens

Brand files (assets/brand)
  logo-dark.png    logo for cream/light backgrounds
  logo-light.png   logo for dark backgrounds (original)
  needle.png       needle mark
  icon-*.png       app/favicons (16 → 1024), favicon.ico in the root

Notes
  - Login is a front-end design demo: it remembers the user in the browser only. Connect a real backend before launch.
  - The intro loader plays once per browser session (close the tab/browser to see it again).
