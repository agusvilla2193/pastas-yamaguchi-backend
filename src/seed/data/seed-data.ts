export const SEED_DATA = {
    // Datos del Administrador para el Dojo de Pastas
    adminUser: {
        email: 'admin@mail.com', // El email que usás siempre
        password: 'password123',       // Tu contraseña
        firstName: 'Agustin',
        lastName: 'Test',        //
        phone: '1234567890',          //
        address: 'Calle Falsa 123',
        city: 'Buenos Aires',
        role: 'admin' as const,       // Vital para que puedas crear productos
    },

    // Catálogo inicial de Pastas Yamaguchi
    products: [
        {
            name: 'Sorrentinos de Calabaza y Queso',
            description: 'Pasta artesanal rellena de calabaza asada y muzzarella. Plancha de 12 unidades.',
            price: 1,
            stock: 100,
            category: 'Pastas Rellenas',
        },
        {
            name: 'Ravioles de Espinaca',
            description: 'Clásicos ravioles con espinaca fresca y parmesano. Caja para 2 personas.',
            price: 1,
            stock: 50,
            category: 'Pastas Rellenas',
        },
        {
            name: 'Tallarines al Huevo',
            description: 'Fideos cintas anchos amasados con huevos de campo.',
            price: 1,
            stock: 200,
            category: 'Pastas Simples',
        }
    ],
};
