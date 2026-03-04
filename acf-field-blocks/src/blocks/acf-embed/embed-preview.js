/**
 * Internal dependencies
 */
import { getPhotoHtml } from './util';

/**
 * External dependencies
 */
import clsx from 'classnames';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { SandBox } from '@wordpress/components';
import { getAuthority } from '@wordpress/url';

/**
 * Internal dependencies
 */
import WpEmbedPreview from './wp-embed-preview';

export default function EmbedPreview( {
	preview,
	url,
	isSelected,
	className
} ) {

	const { scripts } = preview;

	const html = 'photo' === preview.type ? getPhotoHtml( preview ) : preview.html;
	const embedSourceUrl = getAuthority( url );
	const iframeTitle = sprintf(
		// translators: %s: host providing embed content e.g: www.youtube.com
		__( 'Embedded content from %s' ),
		embedSourceUrl
	);
	const sandboxClassnames = clsx(
		preview.type,
		className,
		'wp-block-acf-field-blocks-acf-embed__wrapper'
	);

	return (
		<>
			{ 'wp-embed' === preview.type ? (
        <WpEmbedPreview html={ html } />
      ) : (
        <div className="wp-block-acf-field-blocks-acf-embed__wrapper">
          <SandBox
            html={ html }
            scripts={ scripts }
            title={ iframeTitle }
            type={ sandboxClassnames }
          />
        </div>
      ) }
		</>
	);
}
