/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { Provider } from 'react-redux';
import { styledMount as mount } from 'spec/helpers/theming';
import sinon from 'sinon';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import DeleteComponentButton from 'src/dashboard/components/DeleteComponentButton';
import EditableTitle from 'src/components/EditableTitle';
import HoverMenu from 'src/dashboard/components/menu/HoverMenu';
import WithPopoverMenu from 'src/dashboard/components/menu/WithPopoverMenu';
import { Draggable } from 'src/dashboard/components/dnd/DragDroppable';
import Header from 'src/dashboard/components/gridComponents/Header';
import newComponentFactory from 'src/dashboard/util/newComponentFactory';
import {
  HEADER_TYPE,
  DASHBOARD_GRID_TYPE,
} from 'src/dashboard/util/componentTypes';

import { mockStoreWithTabs } from 'spec/fixtures/mockStore';

describe('Header', () => {
  const props = {
    id: 'id',
    parentId: 'parentId',
    component: newComponentFactory(HEADER_TYPE),
    depth: 1,
    parentComponent: newComponentFactory(DASHBOARD_GRID_TYPE),
    index: 0,
    editMode: false,
    embeddedMode: false,
    filters: {},
    handleComponentDrop() {},
    deleteComponent() {},
    updateComponents() {},
  };

  function setup(overrideProps) {
    // We have to wrap provide DragDropContext for the underlying DragDroppable
    // otherwise we cannot assert on DragDroppable children
    const wrapper = mount(
      <Provider store={mockStoreWithTabs}>
        <DndProvider backend={HTML5Backend}>
          <Header {...props} {...overrideProps} />
        </DndProvider>
      </Provider>,
    );
    return wrapper;
  }

  it('should render a Draggable', () => {
    const wrapper = setup();
    expect(wrapper.find(Draggable)).toBeTruthy();
  });

  it('should render a WithPopoverMenu', () => {
    const wrapper = setup();
    expect(wrapper.find(WithPopoverMenu)).toBeTruthy();
  });

  it('should render a HoverMenu in editMode', () => {
    let wrapper = setup();
    expect(wrapper.find(HoverMenu).length).toBe(0);

    // we cannot set props on the Header because of the WithDragDropContext wrapper
    wrapper = setup({ editMode: true });
    expect(wrapper.find(HoverMenu).length).toBeGreaterThan(0);
  });

  it('should render an EditableTitle with meta.text', () => {
    const wrapper = setup();
    expect(wrapper.find(EditableTitle)).toBeTruthy();
    expect(wrapper.find('.editable-title').text()).toBe(
      props.component.meta.text,
    );
  });

  it('should call updateComponents when EditableTitle changes', () => {
    const updateComponents = sinon.spy();
    const wrapper = setup({ editMode: true, updateComponents });
    wrapper.find(EditableTitle).prop('onSaveTitle')('New title');

    const headerId = props.component.id;
    expect(updateComponents.callCount).toBe(1);
    expect(updateComponents.getCall(0).args[0][headerId].meta.text).toBe(
      'New title',
    );
  });

  it('should render a DeleteComponentButton when focused in editMode', () => {
    const wrapper = setup({ editMode: true });
    wrapper.find(WithPopoverMenu).simulate('click'); // focus

    expect(wrapper.find(DeleteComponentButton)).toBeTruthy();
  });

  it('should call deleteComponent when deleted', () => {
    const deleteComponent = sinon.spy();
    const wrapper = setup({ editMode: true, deleteComponent });
    wrapper.find(WithPopoverMenu).simulate('click'); // focus
    wrapper.find(DeleteComponentButton).simulate('click');

    expect(deleteComponent.callCount).toBe(1);
  });

  it('should render the AnchorLink in view mode', () => {
    const wrapper = setup();
    expect(wrapper.find('AnchorLink')).toBeTruthy();
  });

  it('should not render the AnchorLink in edit mode', () => {
    const wrapper = setup({ editMode: true });
    expect(wrapper.find('AnchorLink').length).toBe(0);
  });

  it('should not render the AnchorLink in embedded mode', () => {
    const wrapper = setup({ embeddedMode: true });
    expect(wrapper.find('AnchorLink').length).toBe(0);
  });
});
