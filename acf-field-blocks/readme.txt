=== Blocks for ACF Fields — Display Custom Fields in the Block Editor ===
Contributors: gamaup
Tags: acf, block, meta field, meta field block, acf block
Requires at least: 6.5
Tested up to: 7.0
Stable Tag: 1.6.0
Requires PHP: 7.4
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

The easiest way to load ACF & SCF fields in WordPress blocks. Add your custom fields to the block editor instantly — no coding required!

== Description ==
Blocks for ACF Fields lets you effortlessly load and display **Advanced Custom Fields (ACF)** or **Secure Custom Fields (SCF)** inside the WordPress block editor using a single, flexible block. Whether you're dealing with text, images, URLs, or complex field types, this plugin makes it simple — all without writing a single line of code.

= How to Use it =
Just create your custom fields with the ACF or SCF plugin, then open the WordPress block editor. Add the "ACF Field" block to your page or template, select the field you want to display from the dropdown, and you are done! Your custom field will now appear right inside the editor, exactly where you want it.

Want to see it in action? Watch the short demo video below to learn how it works in real time.

[youtube https://www.youtube.com/watch?v=0gjUTgNgn7A]

= Features =
* **No Code Needed** – Display your ACF & SCF fields directly in the editor without building a custom block.
* **One Block for All Fields** – Load almost any field type using just a single, versatile block.
* **Smart Field Picker** – No need to type field names. Choose from a dropdown that automatically shows only the ACF & SCF fields available for the post, page, or template you're editing.
* **Flexible Output Control** – Style and format your field values directly in the editor, with output that always works correctly regardless of the field's return setting.
* **Works With Most Field Types** – From plain text and numbers to images, links, embeds, dates, and icons — most commonly used ACF/SCF field types render right out of the box.
* **Supports All Field Locations** – Works with post fields, options pages, term fields, and user fields.
* **Full Site Editing Ready** – Fully compatible with the WordPress Site Editor for building custom templates and theme parts.
* **Dynamic Layouts Ready** – Seamlessly works inside Query Loops and reusable patterns for dynamic layouts.

In addition to choosing which field to display, you also have control over how it appears. Text-based fields (including multiple-value fields like Select or Checkbox) can be shown as plain text or formatted with typography options. Image fields can be displayed as actual images with the same styling options as core Image blocks. For URL-return fields (such as Link or Post Object), you can render them as clickable buttons that automatically match your theme's design.

= Where Your Fields Come From =
You also have control over where your fields are sourced from, making it easy to connect content dynamically based on the template you're editing.

* **Post (any post type)** – Load fields attached to the post you're currently editing, whether it's a post, page, or any custom post type.
* **Option** – Pull global option fields, perfect for site-wide settings like logos, contact info, or social links.
* **User** – Display fields attached to a user profile. Available when editing author templates, making it easy to showcase author bios, avatars, or custom user data.
* **Taxonomy** – Load fields attached to taxonomy terms. Available when editing term archive templates, ideal for creating custom category, tag, or taxonomy layouts.

Full documentation and usage guides are available at:
[https://www.acffieldblocks.com/documentation/](https://www.acffieldblocks.com/documentation/?utm_source=wordpress.org&utm_medium=wp%20plugins%20repository)

== PRO Version – Unlock the Full Power of ACF & SCF ==

Love the free version? PRO works exactly the same way — pick a block, pick a field, and you're done. Nothing you've already learned changes. PRO simply gives you more to pick from: more supported field types, more layout options, and new ways to choose where your content comes from.

Sooner or later you'll hit a field the free version can't display on its own — a **Repeater**, a **Gallery**, a list of related posts, an interactive **Map**, or a nested **Group**. Normally that's where the fun stops and the PHP begins. PRO lets you build all of it right in the editor instead. Here's what you get:

= Support for Advanced Field Types (no PHP required) =

* **Repeater** – Turn repeater rows into a styleable layout you compose right in the editor. Each sub field becomes its own block, styled with the controls you already know. Display rows as a **List, Grid, Carousel, Accordion, or Tabs**.
* **Gallery** – Render gallery fields as a **Grid, Masonry, or interactive Carousel**, complete with a built-in lightbox and responsive options for different screen sizes.
* **Group** – Access and display sub fields inside group fields individually, no matter how deeply nested.

= 20+ Advanced Display Formats =

PRO doesn't just add new field types — it unlocks powerful new ways to render the fields you already have.

* **Post Object & Relationship** – Display as dynamic post loops (**List, Grid, or Carousel**), similar to the Query Loop block, with the ability to load custom fields within each post. Also supports **Single Post** display — perfect for related posts sections and featured post displays.
* **Taxonomy** – Render as term loops (**List, Grid, or Carousel**) with access to custom fields on each term, plus **Single Term** display. Ideal for flexible category, tag, or custom taxonomy layouts.
* **User** – Display as user loops (**List, Grid, or Carousel**) with custom fields for each user, plus **Single User** display. Great for user directories, contributor listings, and team pages.
* **Google Map** – Display ACF Google Maps fields as an interactive map with custom markers and styling. Perfect for store locators, event venues, or property listings.
* **Embed Popup** – Show an oEmbed or URL field inside a lightbox popup that only loads on click — rich media without slowing your pages down.

= Dynamic Field Sources =

Lite blocks always read from the **current** post, term, user, or an Options Page. PRO frees them:

* **Specific Post / Term / User** – Pin a block to an entity you hand-pick at edit time. Build an editorially-chosen "Featured Page" promo or an "About the Founder" panel that lives anywhere and updates from a single source.
* **URL Parameter** – Let the URL decide the entity at render time. One `/profile/` template can serve every user via `?uid=42`, `?uid=99`, and so on. Optional **Match Rules** validate the URL value as a Post ID, Post Slug, User ID, Username, Email, Term ID, or Term Slug — so one template powers profile pages, dynamic landing pages, and review tools without registering a custom route.

= Block Visibility by ACF / SCF Value =

Show or hide **any block** — not just ACF blocks, but every Group, Heading, Cover, and third-party block — based on the value of an ACF or SCF field. Build the rules visually in the block sidebar: pick a field, pick a comparison, give it a value. Combine multiple rules with **AND** (within a group) and **OR** (across groups), the same shape ACF's own conditional logic uses. Rules are evaluated **server-side at render time**, so hidden blocks emit no HTML at all — no empty wrappers, no client-side flash. In the editor, every block stays visible so you can keep editing.

Start with the free version, build what you can, and upgrade only when you hit a wall. PRO is a standalone plugin — installing it automatically deactivates Lite to prevent conflicts, and your existing blocks, content, and field configuration are preserved.

[Click here to learn more about PRO version](https://www.acffieldblocks.com/pro/?utm_source=wordpress.org&utm_medium=wp%20plugins%20repository&utm_campaign=BlocksforACFFields%20Pro%20Upgrade)

== Installation ==
= Automatic installation =

Automatic installation is the easiest option as WordPress handles the file transfers itself and you don't even need to leave your web browser. 

1. Go to your WordPress Plugin installation menu (Dashboard > Plugins > Add New)
2. In the search field type Blocks for ACF Fields and press enter.
3. \"Install Now\" and then click \"Active\"

= Manual installation =

For Manual installation, you download our product from WordPress directory uploading it to your web-server via your FTP or CPanel application.

1. Download the plugin and unzip it
2. Using an FTP program or CPanel upload the unzipped plugin folder to your WordPress installation's wp-content/plugins/ directory.
3. Activate the plugin from the Plugins menu (Dashboard > Plugins > Installed Plugins) within the WordPress admin.

== Frequently Asked Questions ==

= What are the requirements to use this plugin? =

You need to have WordPress version 6.5+ and Advanced Custom Fields plugin version 6.1.0 or newer.

= Do I need the pro version of Advanced Custom Fields? =

No, you can still use the free version of Advanced Custom Fields as long as it is version 6.1.0 or newer.

= Who is this plugin for? =

This plugin is built with developers in mind — perfect for those who want to save time without sacrificing flexibility. At the same time, it's intuitive and easy enough for end users to use without technical knowledge.

= Which ACF field types are supported? =

The free version supports most commonly used field types right out of the box. A few advanced types — Repeater, Group, Gallery, and Google Maps (as an interactive map) — require the PRO version, and Flexible Content is not currently supported in either version.

= Can this plugin save or update ACF field values? =

No. This plugin is read-only — it's designed solely to display ACF field values in the block editor. Creating or saving field data should be done through the ACF interface or other editing tools.

= Does this plugin support the Site Editor? =

Yes, of course.

== Screenshots ==

1. Load Fields Inside a Query Block

2. Select Field to Load

3. Field Settings

== Changelog ==

= 1.6.0 =
*Jun 2nd, 2026*

* [PRO Only] **NEW:** New "Specific" field sources — pull field values from a specific post, term, or user instead of the current context
* [PRO Only] **NEW:** New "URL Param" field source — resolve the field source dynamically from a URL query parameter at render time
* **UPDATE:** The ACF Field block's field loader now opens in a focused modal dialog instead of an inline placeholder, giving a clearer setup flow and room for advanced options
* **UPDATE:** ACF Field blocks now display the selected field's label in the editor's List View and breadcrumb, making it easier to identify which field each block is showing
* **UPDATE:** Reworked the sidebar "Field Settings" panel (renamed to "Field Info") into a compact, read-only summary of the selected source and field with a "Replace Field" button that opens the same picker modal used when inserting a block
* **FIX:** Fixed "Objects are not valid as a React child" error when displaying User or Taxonomy fields in the editor

= 1.5.0 =
*Apr 15th, 2026*

* [PRO Only] **NEW:** Embed Popup block — display oEmbed/URL fields in a lightbox popup that loads only on click
* [PRO Only] **NEW:** Display Google Map fields as interactive maps with custom marker and styling
* **NEW:** Display Google Map fields as text with multiple return format options (Address, Lat/Lng, State, Country, Post Code, etc.)
* **NEW:** Display ACF Icon Picker fields as icons with customizable size, color, and alignment
* **NEW:** Added info tooltip to "Display Field As" dropdown showing descriptions for each display option

= 1.4.4 =
*Mar 17th, 2026*

* **FIX:** Fixed PHP 8+ error when `get_the_content()` is called without a valid post object

= 1.4.3 =
*Mar 9th, 2026*

* **FIX:** Fixed PHP 8+ error when `get_the_content()` is called without a valid post object
* **FIX:** Fixed WYSIWYG field output to properly apply ACF content filters instead of using `nl2br()`

= 1.4.2 =
*Mar 4th, 2026*

* **FIX:** Fixed ACF version check timing by moving initialization to `after_setup_theme` hook
* [PRO Only] **FIX:** Fixed REST API validation errors when using block visibility controls on server-side rendered blocks by stripping visibility attributes from block render requests

= 1.4.1 =
*Feb 20th, 2026*

* [PRO Only] **FIX:** Grid style broken on frontend side

= 1.4.0 =
*Feb 19th, 2026*

* **NEW:** Display oEmbed and URL fields as embed
* [PRO Only] **NEW:** Display Repeater fields as accordions
* [PRO Only] **NEW:** Display Repeater fields as tabs

= 1.3.3 =
*Feb 6th, 2026*

* [PRO Only] **FIX:** Add reset post data after loads field as posts loop

= 1.3.2 =
*Feb 3rd, 2026*

* **UPDATE:** Add supports to load term custom field inside term query
* [PRO Only] **UPDATE:** Removes option to load Post Object, Relationship, Taxonomy, User field as List/Grid/Carousel if multiple value is set to false

= 1.3.1 =
*Jan 17th, 2026*

* **UPDATE:** Previewed field values will now automatically update after the post is saved
* **UPDATE:** ACF Field blocks displayed as text, button, or image now supports interactivity to allow being inserted inside Query Loop block with Reload full page is set to false

= 1.3.0 =
*Jan 2nd, 2026*

* [PRO Only] **NEW:** Control block visibility based on ACF/SCF values
* **NEW:** Standardized block hook filters
* **UPDATE:** Removed the "Open in new tab" and "Mark as nofollow" options from Email fields displayed as buttons
* **UPDATE:** Renamed the "Link Text" option to "Button Text" when displaying fields as buttons
* **FIX:** Field options were not showing on single templates for custom post types with dashes in their slugs

= 1.2.8 =
*Nov 20th, 2025*

* [PRO Only] **FIX:** Resolved an issue where ACF post loops did not load custom fields from the linked post type inside nested blocks

= 1.2.7 =
*Nov 8th, 2025*

* **FIX:** Resolved "sprintf is not defined" error on ACF Image fields
* [PRO Only] **UPDATE:** Set a default item count when the value is empty for Post Object, Taxonomy, and User fields using grid layouts. The default count now follows the "Items per Row" setting for consistent grid output

= 1.2.6 =
*Oct 24th, 2025*

* [PRO Only] **FIX:** Allowed adding Content blocks inside the ACF Posts List block
* [PRO Only] **FIX:** Prevented "acf-field-blocks/data" store from being registered multiple times
* [PRO Only] **UPDATE:** Updated Freemius SDK to v2.12.2

= 1.2.5 =
*Sep 15th, 2025*

* **NEW:** Options to select which value to display for User fields, including Display Name, User Email, User Login, User Nickname, and User URL
* **NEW:** Options to select which value to display for Taxonomy fields, including Name, Slug, and Description

= 1.2.4 =
*Jul 6th, 2025*

* [PRO Only] **NEW:** Display Repeater fields as a carousel
* [PRO Only] **NEW:** Display Post fields as a carousel
* [PRO Only] **NEW:** Display Taxonomy fields as a carousel
* [PRO Only] **NEW:** Display User fields as a carousel

= 1.2.3 =
*Jun 20th, 2025*

* [PRO Only] **NEW:** Display Gallery fields using a masonry layout
* **UPDATE:** Added an upgrade notice when selecting unsupported field types
* **UPDATE:** Added a review notice

= 1.2.2 =
*Jun 9th, 2025*

* **FIX:** Resolved an undefined `get_current_screen` call introduced in the previous update

= 1.2.1 =
*Jun 7th, 2025*

* **FIX:** Fixed broken styles on several admin pages

= 1.2.0 =
*May 12th, 2025*

* **PRO:** Initial PRO version release

= 1.1.4 =
*May 3rd, 2025*

* **FIX:** Fixed "Class Fields not found" error

= 1.1.3 =
*May 2nd, 2025*

* **FIX:** Fixed an error with ACF Image fields from the previous update

= 1.1.2 =
*May 1st, 2025*

* **FIX:** Hide ACF Button when the value is empty
* **FIX:** Fixed an issue where ACF Button text was not loading correctly when using an alternative field option
* **UPDATE:** Refactored several field helper functions

= 1.1.1 =
*Apr 23rd, 2025*

* **FIX:** Fixed an error when loading blocks in the Pattern Editor

= 1.1.0 =
*Apr 20th, 2025*

* **NEW:** Introduced a unified "ACF Field" block to load all field types; previously separated field-type blocks are now hidden from the inserter
* **NEW:** Added hooks to filter field output
* **UPDATE:** Added shadow support to the ACF Image block
* **UPDATE:** Added UL and OL tag options to the ACF Text block, enabling list output for multi-value fields
* **UPDATE:** Updated all editor components to prevent deprecation warnings
* **UPDATE:** Removed the "Open in New Tab" option for linked Email fields
* **FIX:** New lines were not rendered correctly in Textarea fields
* **FIX:** Post Object and Relationship fields were not rendered correctly on the frontend
* **FIX:** Date field values (Date, DateTime, Time) were not formatted according to the field’s date format settings

= 1.0.0 =
*Sep 17th, 2024*

* Initial release