import { hasValue } from "src/app/shared/empty.util";
export const SECTION_LICENSE_FORM_LAYOUT = {

  granted: {
    element: {
      container: 'custom-control custom-checkbox pl-1',
      control: 'custom-control-input',
      label: 'custom-control-label pt-1'
    }
  }
};

export const SECTION_LICENSE_FORM_MODEL = [
  {
    id: 'granted',
    label: (typeof window === 'object' && hasValue(window.localStorage)) && window.localStorage.getItem('selectedLangCode') === 'ar' ?  'أؤكد الترخيص أعلاه':'I confirm the license above',
    required: true,
    value: false,
    validators: {
      required: null
    },
    errorMessages: {
      required:(typeof window === 'object' && hasValue(window.localStorage)) && window.localStorage.getItem('selectedLangCode') === 'ar' ? 'يجب عليك قبول الترخيص': 'You must accept the license',
      notgranted: (typeof window === 'object' && hasValue(window.localStorage)) && window.localStorage.getItem('selectedLangCode') === 'ar' ? 'يجب عليك قبول الترخيص': 'You must accept the license'
    },
    type: 'CHECKBOX',
  }
];