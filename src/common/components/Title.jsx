import React from 'react'

const styles = {
  center: {
    display: 'flex',
    alignItems: 'center',
  },
}

function Title({label, children}) {
  return (
    <h1 style={styles.center}>
      <span style={{...styles.center, flex: 1}}>{label}</span>
      {children}
    </h1>
  )
}

export default Title
