import { override } from '@microsoft/decorators'
import {
	BaseApplicationCustomizer,
	PlaceholderName,
} from '@microsoft/sp-application-base'
import { Log } from '@microsoft/sp-core-library'
import './BreadcrumbApplicationCustomizer.module.scss'

const LOG_SOURCE: string = 'BreadcrumbApplicationCustomizer'

export interface IBreadcrumbApplicationCustomizerProperties {}

export default class BreadcrumbApplicationCustomizer extends BaseApplicationCustomizer<IBreadcrumbApplicationCustomizerProperties> {
	private capitalizeFirstLetter(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1)
	}
	private placeholder: any

	@override
	public onInit(): Promise<void> {
		Log.info(LOG_SOURCE, `Initialized BreadcrumbApplicationCustomizer`)

		this.renderBreadcrumb()

		this.context.application.navigatedEvent.add(this, this.renderBreadcrumb)

		return Promise.resolve()
	}

	private renderBreadcrumb = (): void => {
		const existing = document.getElementById('custom-breadcrumb')
		if (existing) {
			existing.remove()
		}

		const container = document.createElement('div')
		container.id = 'custom-breadcrumb'
		container.className = 'custom-breadcrumb'
		container.style.fontSize = '14px'
		container.style.color = 'inherit'

		let pathParts = window.location.pathname
			.split('/')
			.filter(
				(part) =>
					part &&
					part.toLowerCase() !== 'sites' &&
					part.toLowerCase() !== 'sitepages' &&
					part.toLowerCase() !== '_layouts' &&
					part !== '15'
			)

		console.log('Breadcrumb path parts before removing home:', pathParts)

		// Убираем первую крошку, если она 'home'
		if (pathParts.length > 0 && pathParts[0].toLowerCase() === 'home') {
			pathParts.shift()
		}

		console.log('Breadcrumb path parts after removing home:', pathParts)

		if (pathParts.length === 0) return

		let breadcrumbHtml =
			'<ol style="margin:0;padding:0;list-style:none;display:flex;flex-wrap:wrap;align-items:center;">'

		let currentPath = '/sites'

		pathParts.forEach((part, index) => {
			const cleanPart = part.replace('.aspx', '')
			const isLast = index === pathParts.length - 1

			if (index > 0) {
				breadcrumbHtml += `<li style="margin:0 5px;">&gt;</li>`
			}

			currentPath += index === 0 ? `/${cleanPart}` : `/SitePages/${cleanPart}`

			const partHtml = isLast
				? `<span style="font-weight:bold;color:inherit;text-decoration:none;">${this.capitalizeFirstLetter(
						decodeURIComponent(cleanPart)
				  )}</span>`
				: `<a href="${currentPath}" style="text-decoration:none;color:inherit;">${this.capitalizeFirstLetter(
						decodeURIComponent(cleanPart)
				  )}</a>`

			breadcrumbHtml += `<li>${partHtml}</li>`
		})

		breadcrumbHtml += '</ol>'

		container.innerHTML = breadcrumbHtml

		this.placeholder = this.context.placeholderProvider.tryCreateContent(
			PlaceholderName.Top
		)
		if (this.placeholder && this.placeholder.domElement) {
			this.placeholder.domElement.appendChild(container)
		}
	}
}
