import './editor.scss';

import {
	useEffect,
	useState,
	RawHTML
} from '@wordpress/element';
import {
	SelectControl,
	Button,
	Notice,
	Popover,
	Icon,
} from '@wordpress/components';
import { info } from '@wordpress/icons';
import { __, sprintf } from '@wordpress/i18n';

import FieldSettings from '../field-settings'
import {
	useFieldsLoader,
	isFieldHasReturn,
	isSpecificSource
} from '../../functions'
import { displayAsToBlock } from '../../utils/display-as-to-block'
import { DISPLAY_OPTION_DESCRIPTIONS, PRO_OPTIONS } from './display-options'

const FieldSelector = ({
	label,
	selectedSource,
	selectedSourceValue = '',
	selectedSourceMeta = {},
	selectedField,
	onSelectSource,
	onSelectSourceValue = () => {},
	onSelectSourceMeta = () => {},
	onSelectField,
	onLoadField,
	context,
	clientId,
	repeaterFields = "hide",
	className = '',
	footerStart = null
}) => {

	const [ blockTypeOptions, setBlockTypeOptions ]   = useState([]);
	const [ displayAs, setDisplayAs ]                 = useState('');
	const [ selectedFieldType, setSelectedFieldType ] = useState('');
	const [ fieldFilter, setFieldFilter ]             = useState({});
	const [ showTooltip, setShowTooltip ]             = useState( false );
	const [ hasProOnlyOptions, setHasProOnlyOptions ] = useState( false );

	const {
		getField,
		getValue,
		isLoadingFields
	} = useFieldsLoader( selectedSource, context, selectedSourceValue );

	useEffect( () => {
		if ( 'map' === displayAs ) {
			setFieldFilter({ type: ['google_map'] });
		} else {
			setFieldFilter({});
		}
	}, [ displayAs ] );

	const isPro = window.ACFFieldBlocksPro?.isPro;

	const addOption = ( options, value, label, descriptionKey ) => {
		const isProOption = PRO_OPTIONS.has( value );
		const desc = descriptionKey || value;
		if ( isProOption && ! isPro ) {
			options.push({ value, label: `${ label } (Pro)`, disabled: true, desc });
		} else {
			options.push({ value, label, desc });
		}
	};

	useEffect( () => {
		let typeOptions = [];
		if ( selectedField ) {
			if ( ! isLoadingFields ) {
				const field = getField( selectedField );
				if ( ! field ) {
					setBlockTypeOptions( typeOptions );
					return;
				}
				setSelectedFieldType( field.type )
				if ( isFieldHasReturn( field, 'text' ) ) {
					addOption( typeOptions, 'text', 'Text' );
				}
				if ( isFieldHasReturn( field, 'image' ) ) {
					addOption( typeOptions, 'image', 'Image' );
				}
				if ( isFieldHasReturn( field, 'link' ) ) {
					addOption( typeOptions, 'button', 'Button' );
				}
				if ( isFieldHasReturn( field, 'oembed' ) || 'url' === field.type ) {
					addOption( typeOptions, 'embed', 'Embed' );
					addOption( typeOptions, 'embed-popup', 'Embed Popup' );
				}
				if ( isFieldHasReturn( field, 'icon' ) ) {
					addOption( typeOptions, 'icon', 'Icon' );
				}
				if ( 'google_map' === field.type ) {
					addOption( typeOptions, 'map', 'Map' );
				}
				if ( isFieldHasReturn( field, 'repeater' ) ) {
					addOption( typeOptions, 'repeater-list', 'List' );
					addOption( typeOptions, 'repeater-grid', 'Grid' );
					addOption( typeOptions, 'repeater-carousel', 'Carousel' );
					addOption( typeOptions, 'repeater-accordion', 'Accordion' );
					addOption( typeOptions, 'repeater-tabs', 'Tabs' );
				}
				if ( isFieldHasReturn( field, 'gallery' ) ) {
					addOption( typeOptions, 'gallery-grid', 'Image Grid' );
					addOption( typeOptions, 'gallery-carousel', 'Image Carousel' );
					addOption( typeOptions, 'gallery-masonry', 'Image Masonry' );
				}
				if ( isFieldHasReturn( field, 'post-loop' ) ) {
					if ( field.multiple ) {
						addOption( typeOptions, 'post-list', 'Post Loop - List' );
						addOption( typeOptions, 'post-grid', 'Post Loop - Grid' );
						addOption( typeOptions, 'post-carousel', 'Post Loop - Carousel' );
					} else {
						addOption( typeOptions, 'post-list', 'Single Post', 'single-post' );
					}
				}
				if ( isFieldHasReturn( field, 'term-loop' ) ) {
					if ( field.multiple ) {
						addOption( typeOptions, 'term-list', 'Term Loop - List' );
						addOption( typeOptions, 'term-grid', 'Term Loop - Grid' );
						addOption( typeOptions, 'term-carousel', 'Term Loop - Carousel' );
					} else {
						addOption( typeOptions, 'term-list', 'Single Term', 'single-term' );
					}
				}
				if ( isFieldHasReturn( field, 'user-loop' ) ) {
					if ( field.multiple ) {
						addOption( typeOptions, 'user-list', 'User Loop - List' );
						addOption( typeOptions, 'user-grid', 'User Loop - Grid' );
						addOption( typeOptions, 'user-carousel', 'User Loop - Carousel' );
					} else {
						addOption( typeOptions, 'user-list', 'Single User', 'single-user' );
					}
				}
			}
		}
		const hasSelectableOption = typeOptions.some( opt => ! opt.disabled );
		const proOnly = typeOptions.length > 0 && ! hasSelectableOption;
		setHasProOnlyOptions( proOnly );
		if ( proOnly ) {
			typeOptions = [];
		}
		setBlockTypeOptions( typeOptions );
		if ( typeOptions.length ) {
			const firstSelectable = typeOptions.find( opt => ! opt.disabled );
			setDisplayAs( firstSelectable ? firstSelectable.value : '' );
		} else {
			setDisplayAs('');
		}
	}, [ selectedSource, selectedField, isLoadingFields] );

	const handleLoadField = () => {
		const { blockName, extraAttrs } = displayAsToBlock( displayAs );
		onLoadField( blockName, extraAttrs );
	}

	const requiresSourceValue = isSpecificSource( selectedSource );

	return (
		<div className={ `acf-field-selector${ className ? ' ' + className : '' }` }>
			<div className="acf-field-selector__label">{ label }</div>
			<div className="acf-field-selector__fieldset">
				<FieldSettings
					fieldSource={ selectedSource }
					fieldSourceValue={ selectedSourceValue }
					fieldSourceMeta={ selectedSourceMeta }
					fieldKey={ selectedField }
					onChangeFieldSource={ onSelectSource }
					onChangeFieldSourceValue={ onSelectSourceValue }
					onChangeFieldSourceMeta={ onSelectSourceMeta }
					onChangeFieldKey={ value => onSelectField( value ) }
					filterBy={ fieldFilter }
					repeaterFields={ repeaterFields }
					context={ context }
					clientId={ clientId }
					sourceHelp={ null }
					fieldHelp={ null }
				/>
				{ 1 < blockTypeOptions.length && (
					<div className="smaller-field">
						<SelectControl
							label={
								<>
									{ __( 'Display Field as', 'acf-field-blocks' ) }
									<span
										className="acf-field-selector__info-icon"
										onMouseEnter={ () => setShowTooltip( true ) }
										onMouseLeave={ () => setShowTooltip( false ) }
									>
										<Icon icon={ info } size={ 16 } />
										{ showTooltip && (
											<Popover
												placement="top"
												animate={ false }
												noArrow={ false }
												focusOnMount={ false }
												className="acf-field-selector__tooltip"
											>
												<div className="acf-field-selector__tooltip-content">
													{ blockTypeOptions.map( ( opt, i ) => {
														const label = opt.label.replace( / \(Pro\)$/, '' );
														const desc = DISPLAY_OPTION_DESCRIPTIONS[ opt.desc ] || '';
														const suffix = opt.disabled ? ' (Pro)' : '';
														return (
															<div key={ i } className="acf-field-selector__tooltip-item">
																<strong>{ label }{ suffix }</strong>
																<span>{ desc }</span>
															</div>
														);
													} ) }
												</div>
											</Popover>
										) }
									</span>
								</>
							}
							value={ displayAs }
							onChange={ value => {
								if ( ! isPro && PRO_OPTIONS.has( value ) ) {
									return;
								}
								setDisplayAs( value );
							} }
							options={ blockTypeOptions }
							__nextHasNoMarginBottom={true}
							__next40pxDefaultSize={true}
						/>
					</div>
				) }
				{ footerStart ? (
					<div className="acf-field-selector__footer">
						<div className="acf-field-selector__footer-start">{ footerStart }</div>
						<Button
							__next40pxDefaultSize={ true }
							variant="primary"
							text={ "only" === repeaterFields ? __( "Load Sub Field", "acf-field-blocks" ) : __( "Load Field", "acf-field-blocks" ) }
							disabled={
								! selectedField
								|| 0 === blockTypeOptions.length
								|| ( requiresSourceValue && ! selectedSourceValue )
							}
							onClick={ handleLoadField }
						/>
					</div>
				) : (
					<Button
						__next40pxDefaultSize={ true }
						variant="primary"
						text={ "only" === repeaterFields ? __( "Load Sub Field", "acf-field-blocks" ) : __( "Load Field", "acf-field-blocks" ) }
						disabled={
							! selectedField
							|| 0 === blockTypeOptions.length
							|| ( requiresSourceValue && ! selectedSourceValue )
						}
						onClick={ handleLoadField }
					/>
				) }
			</div>
			{ selectedField && 0 === blockTypeOptions.length && (
				<>
					{ hasProOnlyOptions ? (
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
