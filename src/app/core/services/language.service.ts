import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, signal } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';

export type SupportedLanguage = 'vi' | 'en';

type TranslationKey = keyof typeof TRANSLATIONS.vi;

const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = ['vi', 'en'];
const DEFAULT_LANGUAGE: SupportedLanguage = 'vi';

const TRANSLATIONS = {
  vi: {
    'common.language': 'Ngôn ngữ',
    'common.guest': 'Khách',
    'common.notSignedIn': 'Chưa đăng nhập',
    'common.logout': 'Đăng xuất',
    'common.login': 'Đăng nhập',
    'common.home': 'Về trang home',
    'common.products': 'Sản phẩm',
    'common.cart': 'Giỏ hàng',
    'common.orders': 'Đơn hàng',
    'common.account': 'Vào tài khoản',
    'common.closeNavigation': 'Đóng menu điều hướng',
    'common.openNavigation': 'Mở menu điều hướng',
    'admin.navigation': 'Điều hướng',
    'admin.area': 'Quản trị',
    'admin.workspace': 'Admin workspace',
    'admin.quickTitle': 'Điều hướng nhanh toàn bộ trang admin',
    'admin.quickDescription': 'Tối giản phần đầu trang, thêm tìm kiếm để mở nhanh module cần thao tác.',
    'admin.searchLabel': 'Tìm trang admin',
    'admin.searchPlaceholder': 'users, orders, products...',
    'admin.empty': 'Không tìm thấy trang admin phù hợp.',
    'admin.footerTitle': 'TTL Ecommerce Admin',
    'admin.footerDescription': 'Vận hành gọn gàng và tập trung vào nội dung chính',
    'client.brand': 'TTL Điện máy',
    'client.tagline': 'Mua sắm nhanh, giao diện gọn gàng',
    'client.guestName': 'Khách vãng lai',
    'client.guestHint': 'Chọn sản phẩm phù hợp cho bạn',
    'client.footerDescription': 'Mua sắm đơn giản, tập trung vào sản phẩm và đơn hàng',
    'nav.overview': 'Tổng quan',
    'nav.overviewDescription': 'Điểm vào nhanh cho toàn bộ khu vực admin.',
    'nav.dashboard': 'Dashboard',
    'nav.dashboardDescription': 'Xem tổng quan hệ thống và lối tắt quản trị.',
    'nav.search': 'Search',
    'nav.searchDescription': 'Tìm nhanh chức năng admin theo tên hoặc nhóm.',
    'nav.usersSection': 'Quản trị người dùng',
    'nav.usersSectionDescription': 'Người dùng, vai trò và phân quyền.',
    'nav.users': 'Users',
    'nav.usersDescription': 'Quản lý danh sách user, trạng thái và role.',
    'nav.roles': 'Roles',
    'nav.rolesDescription': 'Quản lý role và bộ permission tương ứng.',
    'nav.catalog': 'Catalog',
    'nav.catalogDescription': 'Sản phẩm, category, brand, tồn kho và thuộc tính.',
    'nav.brands': 'Brands',
    'nav.brandsDescription': 'Quản lý thương hiệu và hình ảnh đại diện.',
    'nav.categories': 'Categories',
    'nav.categoriesDescription': 'Quản lý category và cấu trúc danh mục.',
    'nav.products': 'Products',
    'nav.productsDescription': 'Quản lý sản phẩm và biến thể.',
    'nav.inventory': 'Inventory',
    'nav.inventoryDescription': 'Theo dõi tồn kho và tình trạng bán.',
    'nav.attributes': 'Attributes',
    'nav.attributesDescription': 'Quản lý thuộc tính dùng cho product schema.',
    'nav.operations': 'Operations',
    'nav.operationsDescription': 'Thao tác đồng bộ dữ liệu catalog.',
    'nav.orderSection': 'Đơn hàng',
    'nav.orderSectionDescription': 'Theo dõi và xử lý đơn hàng.',
    'nav.adminOrders': 'Admin Orders',
    'nav.adminOrdersDescription': 'Xử lý danh sách đơn, trạng thái giao và thanh toán.',
  },
  en: {
    'common.language': 'Language',
    'common.guest': 'Guest',
    'common.notSignedIn': 'Not signed in',
    'common.logout': 'Log out',
    'common.login': 'Log in',
    'common.home': 'Back to home',
    'common.products': 'Products',
    'common.cart': 'Cart',
    'common.orders': 'Orders',
    'common.account': 'Account',
    'common.closeNavigation': 'Close navigation menu',
    'common.openNavigation': 'Open navigation menu',
    'admin.navigation': 'Navigation',
    'admin.area': 'Admin',
    'admin.workspace': 'Admin workspace',
    'admin.quickTitle': 'Quick navigation across admin pages',
    'admin.quickDescription': 'Keep the header compact and use search to open modules quickly.',
    'admin.searchLabel': 'Search admin pages',
    'admin.searchPlaceholder': 'users, orders, products...',
    'admin.empty': 'No matching admin page found.',
    'admin.footerTitle': 'TTL Ecommerce Admin',
    'admin.footerDescription': 'Operate cleanly and focus on core content',
    'client.brand': 'TTL Electronics',
    'client.tagline': 'Fast shopping with a clean interface',
    'client.guestName': 'Guest shopper',
    'client.guestHint': 'Find the right products for you',
    'client.footerDescription': 'Simple shopping focused on products and orders',
    'nav.overview': 'Overview',
    'nav.overviewDescription': 'Quick entry points for the admin area.',
    'nav.dashboard': 'Dashboard',
    'nav.dashboardDescription': 'View system overview and administration shortcuts.',
    'nav.search': 'Search',
    'nav.searchDescription': 'Find admin functions quickly by name or group.',
    'nav.usersSection': 'User management',
    'nav.usersSectionDescription': 'Users, roles, and permissions.',
    'nav.users': 'Users',
    'nav.usersDescription': 'Manage users, statuses, and roles.',
    'nav.roles': 'Roles',
    'nav.rolesDescription': 'Manage roles and permission sets.',
    'nav.catalog': 'Catalog',
    'nav.catalogDescription': 'Products, categories, brands, inventory, and attributes.',
    'nav.brands': 'Brands',
    'nav.brandsDescription': 'Manage brands and representative images.',
    'nav.categories': 'Categories',
    'nav.categoriesDescription': 'Manage categories and catalog structure.',
    'nav.products': 'Products',
    'nav.productsDescription': 'Manage products and variants.',
    'nav.inventory': 'Inventory',
    'nav.inventoryDescription': 'Track stock and selling status.',
    'nav.attributes': 'Attributes',
    'nav.attributesDescription': 'Manage attributes used for product schemas.',
    'nav.operations': 'Operations',
    'nav.operationsDescription': 'Run catalog data synchronization tasks.',
    'nav.orderSection': 'Orders',
    'nav.orderSectionDescription': 'Track and process orders.',
    'nav.adminOrders': 'Admin Orders',
    'nav.adminOrdersDescription': 'Process order lists, delivery status, and payments.',
  },
} as const;

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly currentLanguage = signal<SupportedLanguage>(this.resolveInitialLanguage());

  readonly language = this.currentLanguage.asReadonly();

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    this.applyDocumentLanguage(this.currentLanguage());
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage();
  }

  setLanguage(language: string): void {
    const normalizedLanguage = this.normalizeLanguage(language);
    this.currentLanguage.set(normalizedLanguage);
    this.persistLanguage(normalizedLanguage);
    this.applyDocumentLanguage(normalizedLanguage);
  }

  translate(key: string): string {
    const language = this.currentLanguage();
    return TRANSLATIONS[language][key as TranslationKey] ?? TRANSLATIONS[DEFAULT_LANGUAGE][key as TranslationKey] ?? key;
  }

  private resolveInitialLanguage(): SupportedLanguage {
    const storedLanguage = this.readStoredLanguage();
    if (storedLanguage) {
      return storedLanguage;
    }

    if (typeof navigator === 'undefined') {
      return DEFAULT_LANGUAGE;
    }

    return this.normalizeLanguage(navigator.language || DEFAULT_LANGUAGE);
  }

  private readStoredLanguage(): SupportedLanguage | null {
    if (!this.hasWindow()) {
      return null;
    }

    const storedLanguage = window.localStorage.getItem(STORAGE_KEYS.language);
    return storedLanguage ? this.normalizeLanguage(storedLanguage) : null;
  }

  private persistLanguage(language: SupportedLanguage): void {
    if (this.hasWindow()) {
      window.localStorage.setItem(STORAGE_KEYS.language, language);
    }
  }

  private normalizeLanguage(language: string): SupportedLanguage {
    const languageCode = language.toLowerCase().split('-')[0] as SupportedLanguage;
    return SUPPORTED_LANGUAGES.includes(languageCode) ? languageCode : DEFAULT_LANGUAGE;
  }

  private applyDocumentLanguage(language: SupportedLanguage): void {
    this.document.documentElement.lang = language;
  }

  private hasWindow(): boolean {
    return typeof window !== 'undefined';
  }
}
