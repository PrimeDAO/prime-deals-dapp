export class PCircledNumberDemo {
  state1 = `
    <pcircled-number
      number.bind="1"
      check-mark.to-view="false"
      active.bind="true">
    </pcircled-number>
  `;
  state2 = `
    <pcircled-number
      number.bind="2"
      check-mark.to-view="false"
      active.bind="false">
    </pcircled-number>
  `;
  state3 = `
    <pcircled-number
      number.bind="7"
      check-mark.to-view="true"
      active.bind="false">
    </pcircled-number>
  `;
  state4 = `
    <pcircled-number
      number.bind="5"
      check-mark.to-view="true"
      active.bind="true">
    </pcircled-number>
  `;
}
