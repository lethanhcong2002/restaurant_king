import React from 'react'
import { useLocation } from 'react-router-dom'
import routes from '../routes'
import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname

  // Cập nhật getRouteName để hỗ trợ các route động
  const getRouteName = (pathname, routes) => {
    const currentRoute = routes.find((route) => {
      // Chuyển đổi route path với param động thành regex
      const routeRegex = new RegExp(`^${route.path.replace(/:\w+/g, '\\w+')}$`)
      return routeRegex.test(pathname)
    })
    return currentRoute ? currentRoute.name : false
  }

  const getBreadcrumbs = (location) => {
    const breadcrumbs = []
    const pathSegments = location.split('/').filter(segment => segment !== '') // Filter out empty segments

    let basePath = ''
    pathSegments.forEach((segment, index) => {
      basePath += `/${segment}`

      const routeName = getRouteName(basePath, routes)
      if (routeName) {
        breadcrumbs.push({
          pathname: basePath,
          name: routeName,
          active: index === pathSegments.length - 1, // Set last segment as active
        })
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs(currentLocation)

  return (
    <CBreadcrumb className="my-0">
      {breadcrumbs.map((breadcrumb, index) => {
        return (
          <CBreadcrumbItem
            {...(breadcrumb.active ? { active: true } : { href: breadcrumb.pathname })}
            key={index}
          >
            {breadcrumb.name}
          </CBreadcrumbItem>
        )
      })}
    </CBreadcrumb>
  )
}

export default React.memo(AppBreadcrumb)
