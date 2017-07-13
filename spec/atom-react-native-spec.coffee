AtomReactNative = require '../lib/atom-react-native'

# Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
#
# To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
# or `fdescribe`). Remove the `f` to unfocus the block.

describe "AtomReactNative", ->
  [workspaceElement, activationPromise] = []

  beforeEach ->
    workspaceElement = atom.views.getView(atom.workspace)
    activationPromise = atom.packages.activatePackage('atom-react-native')

  describe "when the atom-react-native:toggle event is triggered", ->
    it "hides and shows the modal panel", ->
      # Before the activation event the view is not on the DOM, and no panel
      # has been created
      expect(workspaceElement.querySelector('.atom-react-native')).not.toExist()

      # This is an activation event, triggering it will cause the package to be
      # activated.
      atom.commands.dispatch workspaceElement, 'atom-react-native:toggle'

      waitsForPromise ->
        activationPromise

      runs ->
        expect(workspaceElement.querySelector('.atom-react-native')).toExist()

        atomReactNativeElement = workspaceElement.querySelector('.atom-react-native')
        expect(atomReactNativeElement).toExist()

        atomReactNativePanel = atom.workspace.panelForItem(atomReactNativeElement)
        expect(atomReactNativePanel.isVisible()).toBe true
        atom.commands.dispatch workspaceElement, 'atom-react-native:toggle'
        expect(atomReactNativePanel.isVisible()).toBe false

    it "hides and shows the view", ->
      # This test shows you an integration test testing at the view level.

      # Attaching the workspaceElement to the DOM is required to allow the
      # `toBeVisible()` matchers to work. Anything testing visibility or focus
      # requires that the workspaceElement is on the DOM. Tests that attach the
      # workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement)

      expect(workspaceElement.querySelector('.atom-react-native')).not.toExist()

      # This is an activation event, triggering it causes the package to be
      # activated.
      atom.commands.dispatch workspaceElement, 'atom-react-native:toggle'

      waitsForPromise ->
        activationPromise

      runs ->
        # Now we can test for view visibility
        atomReactNativeElement = workspaceElement.querySelector('.atom-react-native')
        expect(atomReactNativeElement).toBeVisible()
        atom.commands.dispatch workspaceElement, 'atom-react-native:toggle'
        expect(atomReactNativeElement).not.toBeVisible()
