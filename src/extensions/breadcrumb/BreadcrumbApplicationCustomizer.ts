import { override } from '@microsoft/decorators'
import {
	BaseApplicationCustomizer,
	PlaceholderName,
} from '@microsoft/sp-application-base'
import { Log } from '@microsoft/sp-core-library'

const LOG_SOURCE: string = 'BreadcrumbApplicationCustomizer'

export interface IBreadcrumbApplicationCustomizerProperties {}

export default class BreadcrumbApplicationCustomizer extends BaseApplicationCustomizer<IBreadcrumbApplicationCustomizerProperties> {
	private placeholder: any

	@override
	public onInit(): Promise<void> {
		Log.info(LOG_SOURCE, `Initialized BreadcrumbApplicationCustomizer`)

		this.renderBreadcrumb()

		// Следим за навигацией
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
		container.style.padding = '10px'
		container.style.fontSize = '14px'

		const pathParts = window.location.pathname
			.split('/')
			.filter(
				(part) =>
					part &&
					part.toLowerCase() !== 'sites' &&
					part.toLowerCase() !== 'sitepages' &&
					part.toLowerCase() !== '_layouts' &&
					part !== '15'
			)

		let breadcrumbHtml =
			'<ol style="margin:0; padding:0; list-style:none; display:flex; flex-wrap:wrap; align-items:center;">'

		// Всегда "Home"
		breadcrumbHtml += `
      <li>
        <a href="/" style="text-decoration:none; color:blue;">Home</a>
      </li>
    `

		let currentPath = '/'

		pathParts.forEach((part, index) => {
			const cleanPart = part.replace('.aspx', '')
			const isLast = index === pathParts.length - 1
			const isSiteName = index === 0

			if (isSiteName) {
				currentPath += `sites/${cleanPart}`
			} else {
				currentPath += `/SitePages/${cleanPart}`
			}

			breadcrumbHtml += `
        <li style="margin: 0 5px;">&gt;</li>
        <li>
          ${
						isLast
							? `<span style="font-weight: bold;">${this.capitalizeFirstLetter(
									decodeURIComponent(cleanPart)
							  )}</span>`
							: `<a href="${currentPath}" style="text-decoration:none; color:blue;">${this.capitalizeFirstLetter(
									decodeURIComponent(cleanPart)
							  )}</a>`
					}
        </li>
      `
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

	private capitalizeFirstLetter(text: string): string {
		if (!text) return ''
		return text.charAt(0).toUpperCase() + text.slice(1)
	}
}
