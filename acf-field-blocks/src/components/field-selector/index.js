import './editor.scss';

import {
	useEffect,
	useState,
	RawHTML
} from '@wordpress/element';
import {
	SelectControl,
	Button,
	Notice
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import FieldKeyControl from '../field-key-control'
import FieldSourceControl from '../field-source-control'
import {
	useFieldsLoader,
	isFieldHasReturn
} from '../../functions'

const FieldSelector = ({
	label,
	selectedSource,
	selectedField,
	onSelectSource,
	onSelectField,
	onLoadField,
	context,
	clientId,
	repeaterFields = "hide"
}) => {

	const [ blockTypeOptions, setBlockTypeOptions ]   = useState([]);
	const [ displayAs, setDisplayAs ]                 = useState('');
	const [ selectedFieldType, setSelectedFieldType ] = useState('');
	
	const {
		getField,
		getValue,
		isLoadingFields
	} = useFieldsLoader( selectedSource, context );

	useEffect( () => {
		let typeOptions = [];
		if ( selectedField ) {
			if ( ! isLoadingFields ) {
				const field = getField( selectedField );
				setSelectedFieldType( field.type )
				if ( isFieldHasReturn( field, 'text' ) ) {
					typeOptions.push({
						value: 'text',
						label: 'Text'
					});
				}
				if ( isFieldHasReturn( field, 'image' ) ) {
					typeOptions.push({
						value: 'image',
						label: 'Image'
					});
				}
				if ( isFieldHasReturn( field, 'link' ) ) {
					typeOptions.push({
						value: 'button',
						label: 'Button'
					});
				}
				if ( isFieldHasReturn( field, 'oembed' ) || 'url' === field.type ) {
					typeOptions.push({
						value: 'embed',
						label: 'Embed'
					});
				}
				if ( window.ACFFieldBlocksPro?.isPro ) {
					if ( isFieldHasReturn( field, 'repeater' ) ) {
						typeOptions.push({
							value: 'repeater-list',
							label: 'List'
						});
						typeOptions.push({
							value: 'repeater-grid',
							label: 'Grid'
						});
						typeOptions.push({
							value: 'repeater-carousel',
							label: 'Carousel'
						});
						typeOptions.push({
							value: 'repeater-accordion',
							label: 'Accordion'
						});
						typeOptions.push({
							value: 'repeater-tabs',
							label: 'Tabs'
						});
					}
					if ( isFieldHasReturn( field, 'gallery' ) ) {
						typeOptions.push({
							value: 'gallery-grid',
							label: 'Image Grid'
						});
						typeOptions.push({
							value: 'gallery-carousel',
							label: 'Image Carousel'
						});
						typeOptions.push({
							value: 'gallery-masonry',
							label: 'Image Masonry'
						});
					}
					if ( isFieldHasReturn( field, 'post-loop' ) ) {
						if ( field.multiple ) {
							typeOptions.push({
								value: 'post-list',
								label: 'Post Loop - List'
							});
							typeOptions.push({
								value: 'post-grid',
								label: 'Post Loop - Grid'
							});
							typeOptions.push({
								value: 'post-carousel',
								label: 'Post Loop - Carousel'
							});
						} else {
							typeOptions.push({
								value: 'post-list',
								label: 'Single Post'
							});
						}
					}
					if ( isFieldHasReturn( field, 'term-loop' ) ) {
						if ( field.multiple ) {
							typeOptions.push({
								value: 'term-list',
								label: 'Term Loop - List'
							});
							typeOptions.push({
								value: 'term-grid',
								label: 'Term Loop - Grid'
							});
							typeOptions.push({
								value: 'term-carousel',
								label: 'Term Loop - Carousel'
							});
						} else {
							typeOptions.push({
								value: 'term-list',
								label: 'Single Term'
							});
						}
					}
					if ( isFieldHasReturn( field, 'user-loop' ) ) {
						if ( field.multiple ) {
							typeOptions.push({
								value: 'user-list',
								label: 'User Loop - List'
							});
							typeOptions.push({
								value: 'user-grid',
								label: 'User Loop - Grid'
							});
							typeOptions.push({
								value: 'user-carousel',
								label: 'User Loop - Carousel'
							});
						} else {
							typeOptions.push({
								value: 'user-list',
								label: 'Single User'
							});
						}
					}
				}
			}
		}
		setBlockTypeOptions( typeOptions );
		if ( typeOptions.length ) {
			setDisplayAs( typeOptions[0].value );
		} else {
			setDisplayAs('');
		}
	}, [ selectedSource, selectedField, isLoadingFields] );

	const handleLoadField = () => {
		if ( displayAs.includes("gallery") || displayAs.includes("post") || displayAs.includes("term") || displayAs.includes("user") ) {
			let [block,type] = displayAs.split('-');
			if ( 'post' === block ) {
				block = 'post-loop';
			} else if ( 'term' === block ) {
				block = 'term-loop';
			} else if ( 'user' === block ) {
				block = 'user-loop';
			}
			onLoadField(block,{type})
		} else if ( displayAs.includes("repeater") ) {
			let [block,type] = displayAs.split('-');
			if ( ! [ 'accordion', 'tabs' ].includes(type) ) {
				onLoadField(block,{type})
			} else {
				onLoadField(type)	
			}
		} else {
			onLoadField(displayAs)
		}
	}

	return (
		<div className="acf-field-selector">
			<div className="acf-field-selector__label">{ label }</div>
			<div className="acf-field-selector__fieldset">
				<FieldSourceControl
					value={ selectedSource }
					onChange={ onSelectSource }
					clientId={ clientId }
					hasNoMarginBottom={ true }
					context={ context }
					hideIfNoOptions={ false }
					repeaterFields={ repeaterFields }
				/>
				<FieldKeyControl
					label={ __( "Field Name", "acf-field-blocks" ) }
					source={ selectedSource }
					value={ selectedField }
					onChange={ value => onSelectField( value ) }
					context={ context }
				/>
				{ 1 < blockTypeOptions.length && (
					<div className="smaller-field">
						<SelectControl
							label={ __( 'Display Field as', 'acf-field-blocks' ) }
							value={ displayAs }
							onChange={ value => setDisplayAs( value ) }
							options={ blockTypeOptions }
							__nextHasNoMarginBottom={true}
							__next40pxDefaultSize={true}
						/>
					</div>
				) }
				<Button
					__next40pxDefaultSize={ true }
					variant="primary"
					text={ "only" === repeaterFields ? __( "Load Sub Field", "acf-field-blocks" ) : __( "Load Field", "acf-field-blocks" ) }
					disabled={ ! selectedField || 0 === blockTypeOptions.length }
					onClick={ handleLoadField }
				/>
			</div>
			{ selectedField && 0 === blockTypeOptions.length && (
				<>
					{ ! window.ACFFieldBlocksPro?.isPro && ( ["gallery","repeater","group"].includes(selectedFieldType) ) ? (
						<Notice
							status="warning"
							isDismissible={false}
						>
							<RawHTML>{sprintf(
								__( "Sorry, this field is only supported with %sPRO version%s.", "acf-field-blocks" ),
								'<a href="https://www.acffieldblocks.com/pro/?utm_source=usersite&utm_medium=wp%20block%20editor&utm_campaign=BlocksforACFFields%20Pro%20Upgrade" target="_blank">',
								'</a>'
							)}</RawHTML>
						</Notice>
					) : (
						<Notice
							status="warning"
							isDismissible={false}
						>{ __( "Sorry, this field is currently not supported.", "acf-field-blocks" ) }</Notice>
					) }
				</>
			) }
		</div>
	)
}

export default FieldSelector;