import React from 'react'
import Spin from 'antd/lib/spin'

const styles = {
  container: {
    alignItems: 'center',
    background: '#f0f2f5',
    bottom: 0,
    display: 'flex',
    height: '100vh',
    justifyContent: 'center',
    left: 0,
    position: 'fixed',
    right: 0,
    top: 0,
    width: '100%',
    zIndex: 1,
  },
}

function Loader() {
  return (
    <div style={styles.container}>
      <Spin size="large" spinning />
    </div>
  )
}

export default Loader
