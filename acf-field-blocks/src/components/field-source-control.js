import {
	useSelect,
	select
} from '@wordpress/data';
import {
	SelectControl,
	BaseControl,
	Spinner
} from '@wordpress/components';
import {
	useEffect,
	useState
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	useFieldsLoader
} from '../functions'

const FieldSourceControl = ({
	value,
	onChange,
	clientId,
	context,
	help = null,
	hideIfNoOptions = false,
	repeaterFields = "both",
	hideLabel = false
}) => {

	const [ sourceOptions, setSourceOptions ]             = useState([]);
	const [ ancestorOptions, setAncestorOptions ]         = useState([]);
	const [ isTermLoopDecendant, setIsTermLoopDecendant ] = useState(false);
	const [ isTermTemplate, setIsTermTemplate ]           = useState(false);
	const [ isUserLoopDecendant, setIsUserLoopDecendant ] = useState(false);
	const [ isUserTemplate, setIsUserTemplate ]           = useState(false);
	const isSiteEditor = typeof window.pagenow !== 'undefined' && 'site-editor' === window.pagenow;

	const {
		getField,
		isLoadingFields
	} = useFieldsLoader( value, context );

	useEffect( () => {
		if ( isSiteEditor ) {
			const siteTemplate = select('core/edit-site').getEditedPostId() || select( 'core/editor' ).getCurrentPostId();
			let templateSlug = '';
			if (siteTemplate.includes('//')) {
				[ , templateSlug ] = siteTemplate.split('//');
				if ( 'category' === templateSlug || 'tag' === templateSlug || templateSlug.startsWith('category-') || templateSlug.startsWith('tag-') || templateSlug.startsWith('taxonomy-') ) {
					setIsTermTemplate(true);
				} else if ( 'author' === templateSlug || templateSlug.startsWith('author-') ) {
					setIsUserTemplate(true);
				}
			}
		}
	}, [isSiteEditor] );

	useEffect( () => {
		const {
			getBlockParentsByBlockName,
			getBlocksByClientId
		} = select( 'core/block-editor' );
	
		let repeaterOptions = [];
		let parentNames = [];

		const parentRepeaterClientIds = getBlockParentsByBlockName( clientId, ['acf-field-blocks/acf-repeater','acf-field-blocks/acf-accordion','acf-field-blocks/acf-tabs'] );
		const parentClientIds         = getBlockParentsByBlockName( clientId, ['acf-field-blocks/acf-repeater','acf-field-blocks/acf-term-loop','acf-field-blocks/acf-user-loop','acf-field-blocks/acf-accordion','acf-field-blocks/acf-tabs', 'core/term-template'], true );

		if ( parentClientIds.length ) {
			const parentBlocks = getBlocksByClientId( parentClientIds );
			parentNames = parentBlocks.map( block => block.name );

			if ( parentNames.includes('acf-field-blocks/acf-term-loop') || parentNames.includes('core/term-template') ) {
				setIsTermLoopDecendant(true);
			} else {
				if ( "current_term" === value ) {
					onChange('current_post');
				}
			}

			if ( parentNames.includes('acf-field-blocks/acf-user-loop') ) {
				setIsUserLoopDecendant(true);
			} else {
				if ( "current_user" === value ) {
					onChange('current_post');
				}
			}
		}

		if ( parentRepeaterClientIds.length ) {
			const repeaterParentBlocks = getBlocksByClientId( parentRepeaterClientIds );
			const repeaterParentKeys   = repeaterParentBlocks.map( block => block.attributes.fieldKey );
			if ( ! isLoadingFields ) {
				repeaterOptions = repeaterParentKeys.map( ( parentKey, i ) => {
					const field = getField( parentKey );
					let key = repeaterParentKeys.slice( 0, i + 1 ).join('/');
					return {
						value: `repeater|${key}`,
						label: field?.full_label
					}
				} )
				if ( "" === value && ( 'acf-field-blocks/acf-repeater' === parentNames[0] || 'acf-field-blocks/acf-accordion' === parentNames[0] || 'acf-field-blocks/acf-tabs' === parentNames[0] ) ) {
					onChange( repeaterOptions[ repeaterOptions.length - 1 ].value )
				}
			}
		}
		setAncestorOptions(repeaterOptions);

		if ( "" === value ) {
			if ( parentNames.length && ( 'acf-field-blocks/acf-term-loop' === parentNames[0] || 'core/term-template' === parentNames[0] ) ) {
				onChange('current_term')
			} else if ( parentNames.length && 'acf-field-blocks/acf-user-loop' === parentNames[0] ) {
				onChange('current_user')
			} else {
				onChange("current_post")
			}
		}
		
	}, [isLoadingFields] )

	useEffect( () => {
		let options = [];
		if ( "only" !== repeaterFields ) {
			options.push({
				value: 'current_post',
				label: __( 'Current Post', 'acf-field-blocks' )
			});
			if ( isTermLoopDecendant || isTermTemplate ) {
				options.push({
					value: 'current_term',
					label: __( 'Current Term', 'acf-field-blocks' )
				})
			}
			if ( isUserLoopDecendant || isUserTemplate ) {
				options.push({
					value: 'current_user',
					label: __( 'Current User', 'acf-field-blocks' )
				})
			}
			if ( window.ACFFieldBlocks.hasACFOptionPage ) {
				options.push({
					value: 'option',
					label: __( 'Options', 'acf-field-blocks' )
				})
			}
		}
		if ( ( "both" === repeaterFields || "only" === repeaterFields ) && 0 < ancestorOptions.length ) {
			ancestorOptions.map( opt => {
				options.push({
					value: opt.value,
					label: "both" === repeaterFields ? `Repeater: ${opt.label}` : opt.label
				})
			} )
		}
		if ( "only" === repeaterFields ) {
			options = options.reverse();
		}
		setSourceOptions(options)
		if ( 0 < options.length && "current_post" === value && -1 === options.findIndex( opt => opt.value === value ) ) {
			onChange( options[0].value )
		}
	}, [isTermLoopDecendant,isTermTemplate,isUserLoopDecendant,isUserTemplate,ancestorOptions] )

	if ( isLoadingFields ) {
		return (
			<BaseControl __nextHasNoMarginBottom={true} label={ __( 'Field Source', 'acf-field-blocks' ) }>
				<div>
					<Spinner />
				</div>
			</BaseControl>
		)
	}

	if ( hideIfNoOptions && 1 >= sourceOptions.length ) {
		return '';
	}

	let label = "only" === repeaterFields ? __( 'Parent Field', 'acf-field-blocks' ) : __( 'Field Source', 'acf-field-blocks' );
	if ( hideLabel ) {
		label = '';
	}
	
	return (
		<SelectControl
			label={ label }
			value={ value }
			onChange={ onChange }
			options={ sourceOptions }
			__nextHasNoMarginBottom={ true }
			__next40pxDefaultSize={true}
			help={ help }
		/>
	)
}

export default FieldSourceControl;
