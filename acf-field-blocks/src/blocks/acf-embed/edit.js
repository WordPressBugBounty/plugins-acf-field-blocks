/**
 * External depedencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
  useBlockProps,
  InspectorControls
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import {
  useEffect,
  useState
} from '@wordpress/element';
import {
	useSelect
} from '@wordpress/data';
import {
  ToggleControl,
  PanelBody,
  TextControl,
  Spinner,
  Disabled,
  Placeholder
} from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import EmbedPreview from './embed-preview';
import {
  FieldSourceControl,
  FieldKeyControl,
  FieldPlaceholder,
} from '../../components'
import {
  useFieldsLoader
} from '../../functions'
import {
	getMergedAttributesWithPreview,
} from './util';

export default function Edit( {
  clientId,
  attributes: {
    fieldKey,
    fieldSource,
    showMessageIfEmpty,
    emptyMessage
  },
  className: blockClassName,
  attributes,
  setAttributes,
  isSelected,
  context
} ) {

  const [ fieldValue, setFieldValue ] = useState('');

  const {
    getField,
    getValue,
    isLoadingFields,
    isLoadingValues,
    hasContext
  } = useFieldsLoader( fieldSource, context );

  useEffect( () => {
    if ( fieldKey ) {
      if ( ! isLoadingFields ) {
        const field = getField( fieldKey );
      }
      if ( ! isLoadingValues ) {
        const value = getValue( fieldKey );
        setFieldValue( value );
      }
    }
  }, [ fieldSource, fieldKey, isLoadingFields, isLoadingValues] );

  const {
		preview,
		fetching,
	} = useSelect(
		( select ) => {
			const {
				getEmbedPreview,
				isPreviewEmbedFallback,
				isRequestingEmbedPreview,
				getThemeSupports,
				hasFinishedResolution,
			} = select( coreStore );
			if ( ! fieldValue ) {
				return { fetching: false, cannotEmbed: false };
			}

			const embedPreview = getEmbedPreview( fieldValue );
			const previewIsFallback = isPreviewEmbedFallback( fieldValue );

			// The external oEmbed provider does not exist. We got no type info and no html.
			const badEmbedProvider =
				embedPreview?.html === false &&
				embedPreview?.type === undefined;
			const wordpressCantEmbed = embedPreview?.data?.status === 404;
			const validPreview =
				!! embedPreview && ! badEmbedProvider && ! wordpressCantEmbed;
			return {
				preview: validPreview ? embedPreview : undefined,
				fetching: isRequestingEmbedPreview( fieldValue ),
				themeSupportsResponsive:
					getThemeSupports()[ 'responsive-embeds' ],
				cannotEmbed: ! validPreview || previewIsFallback,
				hasResolved: hasFinishedResolution( 'getEmbedPreview', [
					fieldValue,
				] ),
			};
		},
		[ fieldValue ]
	);

  /**
	 * Returns the attributes derived from the preview, merged with the current attributes.
	 *
	 * @return {Object} Merged attributes.
	 */
	const getMergedAttributes = () =>
		getMergedAttributesWithPreview(
			attributes,
			preview
		);

	// Handle incoming preview.
	useEffect( () => {
		if ( preview ) {
			const mergedAttributes = getMergedAttributes();
			const hasChanges = Object.keys( mergedAttributes ).some(
				( key ) => mergedAttributes[ key ] !== attributes[ key ]
			);

			if ( hasChanges ) {
				setAttributes( mergedAttributes );
			}
		}
	}, [ preview ] );

	const {
		className: classFromPreview,
	} = getMergedAttributes();
	const className = classnames( classFromPreview, blockClassName );
  
  const blockProps = useBlockProps();

  if ( ! fieldKey ) {
    return (
      <div { ...blockProps }>
        { ! isSelected ? __( 'ACF Embed', 'acf-field-blocks' ) : (
          <FieldPlaceholder
            label={ __( 'ACF Embed', 'acf-field-blocks' ) }
            isSelected
          >
            <FieldSourceControl
              value={ fieldSource }
              onChange={ value => setAttributes( { fieldSource: value } ) }
              clientId={ clientId }
              context={ context }
              help={ __( 'Select the object where the field is attached.', 'acf-field-blocks' ) }
            />
            <FieldKeyControl
              label={ __( "Field Name", "acf-field-blocks" ) }
              filterBy={ {
                type: ["oembed","url"]
              } }
              source={ fieldSource }
              value={ fieldKey }
              onChange={ fieldKey => setAttributes( { fieldKey } ) }
              context={ context }
              help={ __( 'Select a custom field to load', 'acf-field-blocks' ) }
            />
          </FieldPlaceholder>
        ) }
      </div>
    )
  }

  return (
    <>

      <InspectorControls>
        <PanelBody
          title={ __( 'Field Settings', 'acf-field-blocks' ) }
          initialOpen={ false }
        >
          <FieldSourceControl
            value={ fieldSource }
            onChange={ value => setAttributes( { fieldSource: value } ) }
            clientId={ clientId }
            help={ __( 'Select the object where the field is attached.', 'acf-field-blocks' ) }
            context={ context }
          />
          <FieldKeyControl
            label={ __( "Field Name", "acf-field-blocks" ) }
            filterBy={ {
							type: ["oembed","url"]
						} }
            source={ fieldSource }
            value={ fieldKey }
            onChange={ fieldKey => setAttributes( { fieldKey } ) }
            context={ context }
            help={ __( 'Select a custom field to load', 'acf-field-blocks' ) }
          />
        </PanelBody>
        <PanelBody
          title={ __( 'Output Settings', 'acf-field-blocks' ) }
        >
          <ToggleControl
            label={ __( "Show message if empty", "acf-field-blocks" ) }
            checked={ showMessageIfEmpty }
            onChange={ value => setAttributes( { showMessageIfEmpty: value } ) }
            __nextHasNoMarginBottom={true}
          />
          { showMessageIfEmpty && (
            <TextControl
              label={ __( 'Empty Message', 'acf-field-blocks' ) }
              value={ emptyMessage }
              onChange={ emptyMessage => setAttributes( { emptyMessage } ) }
              help={ __( 'This message will be displayed if the field has no value', 'acf-field-blocks' ) }
              __nextHasNoMarginBottom={true}
              __next40pxDefaultSize={true}
            />
          ) }
        </PanelBody>
      </InspectorControls>

      { isLoadingFields || isLoadingValues || fetching ? (
        <div { ...blockProps }>
          <Spinner />
        </div>
      ) : ( 
        <div { ...blockProps }>
          { preview ? (
            <Disabled>
              <EmbedPreview
                preview={ preview }
                url={ fieldValue }
                isSelected={ isSelected }
                className={ className }
              />
            </Disabled>
          ) : (
            <Placeholder
              className={ classnames(
                'block-editor-media-placeholder'
              ) }
              style={{
                aspectRatio: '2 / 1'
              }}
              withIllustration
            >
            </Placeholder>
          ) }
        </div>
      ) }
      
      
    </>
  );
};