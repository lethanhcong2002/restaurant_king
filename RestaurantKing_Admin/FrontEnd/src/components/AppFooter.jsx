import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="" target="_blank" rel="noopener noreferrer">
          Restaurant King
        </a>
        <span className="ms-1">&copy; 2024.</span>
      </div>
      <div className="ms-auto">
        <a target="_blank" rel="noopener noreferrer">
          {new Date().toLocaleDateString()}
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
