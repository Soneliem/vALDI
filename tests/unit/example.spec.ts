import { mount } from "@vue/test-utils";
import store from "@/views/StorePage.vue";

describe("store.vue", () => {
  it("renders tab 1 store", () => {
    const wrapper = mount(store);
    expect(wrapper.text()).toMatch("Store");
  });
});
