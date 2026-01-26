export const siteData = {
  brand: {
    name: "Rumah Pintar Calistung",
    tagline: "CALISTUNG OPEN NOW",
    description: "Solusi Belajar Membaca, Menulis, dan Menghitung untuk Anak Usia 4 Tahun ke Atas"
  },
  hero: {
    title: "CALISTUNG",
    subtitle: "OPEN NOW",
    ageInfo: "Usia mulai 4 tahun",
    problemText: "Anak kesulitan",
    skills: ["Membaca", "Menulis", "Menghitung"],
    solutionText: "Kami punya solusinya!"
  },
  benefits: [
    {
      id: 1,
      title: "Pengajar Berpengalaman",
      description: "Tim pengajar profesional dengan pengalaman mengajar anak-anak"
    },
    {
      id: 2,
      title: "Waktu Belajar Banyak Pilihan",
      description: "Jadwal fleksibel yang bisa disesuaikan dengan kebutuhan Anda"
    },
    {
      id: 3,
      title: "Suasana Belajar Yang Nyaman",
      description: "Lingkungan belajar yang kondusif dan menyenangkan"
    },
    {
      id: 4,
      title: "Sistem Belajar Santai dan Ceria",
      description: "Metode pembelajaran yang fun dan tidak membosankan"
    },
    {
      id: 5,
      title: "Menggunakan Peralatan Edukatif",
      description: "Alat bantu belajar modern untuk memaksimalkan pemahaman"
    }
  ],
  classes: {
    regular: {
      title: "KELAS REGULER",
      schedules: [
        {
          days: "Senin, Selasa, dan Rabu",
          times: [
            { session: "Pagi", time: "10.00 - 11.30" },
            { session: "Siang", time: "14.00 - 15.30" },
            { session: "Sore", time: "16.00 - 17.30" }
          ]
        },
        {
          days: "Jumat, Sabtu, dan Minggu",
          times: [
            { session: "Pagi", time: "10.00 - 11.30" },
            { session: "Siang", time: "14.00 - 15.30" },
            { session: "Sore", time: "16.00 - 17.30" }
          ]
        }
      ]
    },
    private: {
      title: "KELAS PRIVAT",
      note: "*peserta datang ke tempat les",
      schedules: [
        {
          days: "Senin, Selasa, dan Rabu",
          times: [
            { session: "Pagi", time: "8.00 - 9.00" },
            { session: "Malam", time: "19.00 - 20.00" }
          ]
        },
        {
          days: "Jumat, Sabtu, dan Minggu",
          times: [
            { session: "Pagi", time: "8.00 - 9.00" },
            { session: "Malam", time: "19.00 - 20.00" }
          ]
        }
      ]
    }
  },
  requirements: [
    "Dapat berkomunikasi dengan baik",
    "Fokus",
    "Mandiri",
    "Dapat bersosialisasi dengan baik"
  ],
  contact: {
    address: "Jalan Merak RT. 11 Kelurahan Tanjung Selor Timur, Kecamatan Tanjung Selor, Kabupaten Bulungan",
    whatsapp: [
      "0852-1106-8989",
      "0812-5656-2765"
    ]
  }
};
