Assets generated (SVG) and conversion instructions

Files created:
- assets/icon.svg              (512x512 target PNG)
- assets/feature-graphic.svg   (1024x500 target PNG)
- assets/screenshot-phone-1.svg (1080x1920)
- assets/screenshot-phone-2.svg (1080x1920)
- store/listing.json           (store metadata)
- store/privacy_policy.md     (privacy policy template)

Convert SVG to PNG (ImageMagick):

```bash
# If you have ImageMagick installed (convert)
convert -background none assets/icon.svg -resize 512x512 assets/icon.png
convert -background none assets/feature-graphic.svg -resize 1024x500 assets/feature-graphic.png
convert -background none assets/screenshot-phone-1.svg -resize 1080x1920 assets/screenshot-phone-1.png
convert -background none assets/screenshot-phone-2.svg -resize 1080x1920 assets/screenshot-phone-2.png
```

Using rsvg-convert (recommended for fidelity):

```bash
rsvg-convert -w 512 -h 512 assets/icon.svg -o assets/icon.png
rsvg-convert -w 1024 -h 500 assets/feature-graphic.svg -o assets/feature-graphic.png
rsvg-convert -w 1080 -h 1920 assets/screenshot-phone-1.svg -o assets/screenshot-phone-1.png
rsvg-convert -w 1080 -h 1920 assets/screenshot-phone-2.svg -o assets/screenshot-phone-2.png
```

If you use macOS or Windows, you can open the SVG files in a vector editor (Inkscape, Illustrator) and export PNGs at the required sizes.

Notes:
- Play Store requires PNG/JPG for icon and graphics. Use the PNG exports above.
- Screenshots must be actual app screenshots ideally; these placeholders are for listing drafts. Replace with real screenshots before publishing.
