import React from 'react'

function ActionBar({children}) {
  return (
    <div
      style={{
        display: 'block',
        position: 'fixed',
        left: 0,
        bottom: 0,
        right: 0,
        padding: '12px 25px',
        background: '#ffffff',
        textAlign: 'right',
        borderTop: '1px solid #e8e8e8',
        boxShadow: '0 -1px 4px rgba(0, 0, 0, .045)',
        zIndex: 1,
      }}
    >
      {children}
    </div>
  )
}

export default ActionBar
