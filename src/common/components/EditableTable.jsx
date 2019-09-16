import React from 'react'
import Form from 'antd/es/form'
import Table from 'antd/es/table'

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

  save = event => {
    const {record, handleSave} = this.props
    this.form.validateFields((error, values) => {
      if (error && error[event.currentTarget.id]) {
        return
      }
      this.toggleEdit()
      handleSave({...record, ...values})
    })
  }

  renderCell = EditField => form => {
    this.form = form
    const {children, dataIndex, record} = this.props
    const {editing} = this.state

    if (!editing) {
      return (
        <div className="editable-cell-value-wrap" onClick={this.toggleEdit}>
          {children}
        </div>
      )
    }

    return (
      <Form.Item wrapperCol={{xs: 24}} style={{margin: 0, padding: 0}}>
        {form.getFieldDecorator(dataIndex, {
          initialValue: record[dataIndex],
        })(
          <EditField
            ref={ref => (this.input = ref)}
            size="large"
            save={this.save}
            onBlur={this.save}
            style={{width: '100%', height: 42}}
          />,
        )}
      </Form.Item>
    )
  }

  render() {
    const {
      EditField,
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
        {EditField ? (
          <EditableContext.Consumer>{this.renderCell(EditField)}</EditableContext.Consumer>
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
    if (!col.EditField) {
      return col
    }

    return {
      ...col,
      onCell: record => ({
        record,
        EditField: col.EditField,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    }
  })

  return (
    <Table
      {...props}
      className="ant-table-editable"
      columns={columns}
      dataSource={dataSource}
      components={components}
      rowClassName={() => 'editable-row'}
      style={{border: 'none'}}
    />
  )
}

export default EditableTable
