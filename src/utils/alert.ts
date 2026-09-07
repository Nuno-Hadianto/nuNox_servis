import Swal from 'sweetalert2'

export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  },
  customClass: {
    popup: 'swal-glass'
  }
})

export const AppAlert = Swal.mixin({
  customClass: {
    popup: 'swal-glass',
    title: 'swal-title',
    htmlContainer: 'swal-text',
    confirmButton: 'btn btn-primary',
    cancelButton: 'btn btn-cancel',
    actions: 'swal-actions-container'
  },
  buttonsStyling: false
})

export const ConfirmDialog = Swal.mixin({
  title: 'Konfirmasi',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Ya, Lanjutkan',
  cancelButtonText: 'Batal',
  customClass: {
    popup: 'swal-glass',
    title: 'swal-title',
    htmlContainer: 'swal-text',
    confirmButton: 'btn btn-primary',
    cancelButton: 'btn btn-cancel',
    actions: 'swal-actions-container'
  },
  buttonsStyling: false
})
