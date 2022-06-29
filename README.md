# tree-table-transfer

```html
<div id="app" class="h-full">
<TreeTableTransfer
    :grid-options="gridOptions"
    :tree-options="treeOptions"
    :data="data"
    :default-selected-data="selectedData"
    :tree-props="treeProps"
/>
</div>
```
```js
import TreeTableTransfer from './components/TreeTableTransfer.vue'

export default {
  name: 'App',
  components: {
    TreeTableTransfer
  },
  data() {
    return {
      data: [
        {
          id: 1,
          label: 'Level one 1',
          children: [
            {
              id: 11,
              pid: 1,
              label: 'Level two 1-1',
              children: [
                {
                  id: 111,
                  pid: 11,
                  label: 'Level three 1-1-1'
                },
                {
                  id: 112,
                  pid: 11,
                  label: 'Level three 1-1-2'
                },
                {
                  id: 113,
                  pid: 11,
                  label: 'Level three 1-1-3'
                }
              ]
            }
          ]
        },
        {
          id: 2,
          label: 'Level one 2',
          children: [
            {
              id: 21,
              pid: 2,
              label: 'Level two 2-1'
            },
            {
              id: 22,
              pid: 2,
              label: 'Level two 2-2'
            }
          ]
        },
        {
          id: 3,
          label: 'Level one 3',
          children: [
            {
              id: 31,
              pid: 3,
              label: 'Level two 3-1'
            },
            {
              id: 32,
              pid: 3,
              label: 'Level two 3-2'
            }
          ]
        }
      ],
      selectedData: [
        {
          id: 1,
          label: 'Level one 1',
          children: [
            {
              id: 11,
              pid: 1,
              label: 'Level two 1-1',
              children: [
                {
                  id: 112,
                  pid: 11,
                  label: 'Level three 1-1-2'
                },
                {
                  id: 113,
                  pid: 11,
                  label: 'Level three 1-1-3'
                }
              ]
            }
          ]
        },
        {
          id: 3,
          label: 'Level one 3',
          children: [
            {
              id: 31,
              pid: 3,
              label: 'Level two 3-1'
            },
            {
              id: 32,
              pid: 3,
              label: 'Level two 3-2'
            }
          ]
        }
      ],
      treeProps: {
        nodeId: 'id',
        nodePid: 'pid'
      },
      treeOptions: {
        showCheckbox: true,
        props: {
          label(data) {
            return data.label
          },
          disabled(data) {
            return [32, 112].indexOf(data.id) > -1
          }
        }
      },
      gridOptions: {
        columns: [
          { type: 'seq', title: 'index', align: 'center', width: 60 },
          {
            field: 'oriTitle',
            title: 'name',
            editRender: { name: 'input', attrs: { placeholder: '' } },
            treeNode: true,
            slots: {
              default: ({ row }) => {
                return [<span>{row.label}</span>]
              },
              edit: ({ row }) => {
                return [<vxe-input v-model={row.label} clearable></vxe-input>]
              }
            }
          }
        ],
        editConfig: {
          trigger: 'click',
          mode: 'cell',
          showStatus: true
        }
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this.selectedData.push({
        id: 2,
        label: 'Level one 2',
        children: [
          {
            id: 22,
            pid: 2,
            label: 'Level two 2-2'
          }
        ]
      })
    }, 2000)
  }
}
```