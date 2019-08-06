import React from 'react'
import Table from 'antd/es/table'
import Input from 'antd/es/input'
import Form from 'antd/es/form'

const EditableContext = React.createContext()

const EditableRow = ({form, index, ...props}) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
)

const EditableFormRow = Form.create()(EditableRow)

class EditableCell extends React.Component {
  state = {
    editing: false,
  }

  toggleEdit = () => {
    const editing = !this.state.editing
    this.setState({editing}, () => {
      if (editing) {
        this.input.focus()
      }
    })
  }

  save = e => {
    const {record, handleSave} = this.props
    this.form.validateFields((error, values) => {
      if (error && error[e.currentTarget.id]) {
        return
      }
      this.toggleEdit()
      handleSave({...record, ...values})
    })
  }

  renderCell = form => {
    this.form = form
    const {children, dataIndex, record} = this.props
    const {editing} = this.state
    return editing ? (
      <Form.Item style={{margin: 0}}>
        {form.getFieldDecorator(dataIndex, {
          initialValue: record[dataIndex],
        })(
          <Input
            ref={node => (this.input = node)}
            onPressEnter={this.save}
            onBlur={this.save}
            style={{width: '100%', height: 40}}
          />,
        )}
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" onClick={this.toggleEdit}>
        {children}
      </div>
    )
  }

  render() {
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      children,
      ...restProps
    } = this.props

    return (
      <td {...restProps}>
        {editable ? (
          <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
        ) : (
          children
        )}
      </td>
    )
  }
}

function EditableTable({onSave: handleSave, dataSource, ...props}) {
  const components = {
    body: {
      row: EditableFormRow,
      cell: EditableCell,
    },
  }

  const columns = props.columns.map(col => {
    if (!col.editable) {
      return col
    }

    return {
      ...col,
      onCell: record => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    }
  })

  return (
    <Table
      {...props}
      columns={columns}
      dataSource={dataSource}
      components={components}
      rowClassName={() => 'editable-row'}
    />
  )
}

export default EditableTable
