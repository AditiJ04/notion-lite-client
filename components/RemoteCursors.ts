import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface RemoteCursor {
  from: number
  name: string
  color: string
}

export const remoteCursorsPluginKey = new PluginKey('remoteCursors')

const RemoteCursors = Extension.create({
  name: 'remoteCursors',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: remoteCursorsPluginKey,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, old) {
            const meta = tr.getMeta(remoteCursorsPluginKey) as Record<string, RemoteCursor> | undefined
            if (!meta) return old.map(tr.mapping, tr.doc)

            const decorations: Decoration[] = []
            Object.values(meta).forEach((cursor) => {
              if (cursor.from > tr.doc.content.size) return

              const el = document.createElement('span')
              el.style.borderLeft = `2px solid ${cursor.color}`
              el.style.marginLeft = '-1px'
              el.style.position = 'relative'
              el.style.pointerEvents = 'none'

              const label = document.createElement('span')
              label.textContent = cursor.name
              label.style.cssText = `
                position: absolute; top: -1.2em; left: -1px;
                font-size: 10px; padding: 1px 5px; border-radius: 4px;
                color: white; background: ${cursor.color};
                white-space: nowrap; font-family: monospace;
              `
              el.appendChild(label)

              decorations.push(Decoration.widget(cursor.from, el, { side: 0 }))
            })

            return DecorationSet.create(tr.doc, decorations)
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },
})

export default RemoteCursors