=== Blocks for ACF Fields — Display Custom Fields in the Block Editor ===
Contributors: gamaup
Tags: acf, block, meta field, meta field block, acf block
Requires at least: 6.5
Tested up to: 6.9
Stable Tag: 1.4.0
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
* **Supports Most ACF/SCF Field Types** – Including text, image, post object, terms, users, and more.
* **Supports All Field Locations** – Works with post fields, options pages, term fields, and user fields.
* **Full Site Editing Ready** – Fully compatible with the WordPress Site Editor for building custom templates and theme parts.
* **Dynamic Layouts Ready** – Seamlessly works inside Query Loops and reusable patterns for dynamic layouts.

In addition to choosing which field to display, you also have control over how it appears. Text-based fields (including multiple-value fields like Select or Checkbox) can be shown as plain text or formatted with typography options. Image fields can be displayed as actual images with the same styling options as core Image blocks. For URL-return fields (such as Link or Post Object), you can render them as clickable buttons that automatically match your theme's design.

With this flexibility, the plugin supports most commonly used field types right out of the box. Here's the full list of supported fields:

* Text
* Text Area
* Number
* Range
* Email
* URL
* Password
* Image
* File
* WYSIWYG
* Select
* Checkbox
* Radio
* Button Group
* True/False
* Link
* Post Object
* Page Link
* Relationship
* Taxonomy
* User
* Date
* Date Time
* Time
* Color

In addition to the wide variety of field types, you also have control over where your fields are sourced from. This makes it easy to connect content dynamically based on the template you're editing.

* **Post (any post type)** – Load fields attached to the post you're currently editing, whether it's a post, page, or any custom post type.
* **Option** – Pull global option fields, perfect for site-wide settings like logos, contact info, or social links.
* **User** – Display fields attached to a user profile. Available when editing author templates, making it easy to showcase author bios, avatars, or custom user data.
* **Taxonomy** – Load fields attached to taxonomy terms. Available when editing term archive templates, ideal for creating custom category, tag, or taxonomy layouts.

Full documentation and usage guides are available at:
[https://www.acffieldblocks.com/documentation/](https://www.acffieldblocks.com/documentation/?utm_source=wordpress.org&utm_medium=wp%20plugins%20repository)

== PRO Version – Unlock Advanced Field Support ==

Upgrade to the PRO version to extend your layouts even further with advanced field types. PRO not only adds support for complex field types but also introduces more advanced output options, giving you full control over how your content is displayed.

**Additional supported field types in PRO:**

* **Repeater** – Easily transform your repeater fields into repeatable content sections inside the block editor. Each sub field can be accessed and styled individually, giving you full flexibility to match your layout needs. You can display them as lists, grids, or carousels, with accordion layouts coming soon.
* **Gallery** – Display your gallery fields in multiple ways: as a grid, masonry, or interactive carousel. Fine-tune responsive layouts with options for different screen sizes, and choose whether images open in a lightbox or link to the full-size version for an engaging user experience.
* **Group** – Easily access and display sub fields inside group fields, no matter how deeply nested.
* **Flexible Content (coming soon)** – Take full advantage of flexible content fields by visually rendering layouts in the block editor. Each layout and its sub fields can be styled individually, making it easier than ever to build custom, dynamic page structures without touching code.

The PRO version doesn't just add support for new field types, it also unlocks **powerful new display options** for fields already supported in the free plugin. These options let you loop through related content and build dynamic layouts directly in the block editor.

* **Post Object & Relationship** – Display these fields as dynamic post loops, similar to the Query Loop block, with the added ability to load custom fields within each post. Choose from list, grid, or carousel layouts, making it perfect for creating related posts sections or featured post displays.
* **Taxonomy** – Render taxonomy fields as term loops, with the ability to access and display custom fields attached to each term. Output them in list, grid, or carousel layouts for flexible category, tag, or custom taxonomy displays.
* **User** – Display user fields as user loops, complete with ability to show custom fields attached to each user. Layouts can be formatted as list, grid, or carousel. Ideal for building user directories, contributor listings, or team layouts.

**Block Visibility by ACF**

Blocks for ACF Fields PRO lets you control **when a block is displayed**, based on the value of an ACF or SCF field. This makes it easy to build smarter layouts without relying on custom PHP conditions or theme logic. Because visibility is handled at the block level, this works seamlessly across the block editor, site editor, templates, and patterns.

From simple field displays to advanced, dynamic layouts, Blocks for ACF Fields gives you full control over how your content appears in the block editor. Start with the free version, and unlock even more powerful options with PRO when you're ready to take your layouts further.

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

This plugin supports most field types, including text, image, URL, true/false, select, date/time, and more. However, the following fields are not supported in the free version: Repeater, Group, Gallery, Google Maps, Icon, Flexible Content, and oEmbed.

= Can this plugin save or update ACF field values? =

No. This plugin is read-only — it's designed solely to display ACF field values in the block editor. Creating or saving field data should be done through the ACF interface or other editing tools.

= Does this plugin support the Site Editor? =

Yes, of course.

== Screenshots ==

1. Load Fields Inside a Query Block

2. Select Field to Load

3. Field Settings

== Changelog ==

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