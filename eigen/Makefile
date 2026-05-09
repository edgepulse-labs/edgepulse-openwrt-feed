include $(TOPDIR)/rules.mk

PKG_NAME:=eigen
PKG_VERSION:=3.4.0
PKG_RELEASE:=1

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.bz2
PKG_SOURCE_URL:=https://gitlab.com/libeigen/eigen/-/archive/$(PKG_VERSION)
PKG_HASH:=b4c198460eba6f28d34894e3a5710998818515104d6e74e5cc331ce31e46e626

PKG_LICENSE:=MPL-2.0 BSD-3-Clause LGPL-2.1
PKG_LICENSE_FILES:=COPYING.MPL2 COPYING.BSD COPYING.LGPL COPYING.README

CMAKE_INSTALL:=1
CMAKE_BINARY_SUBDIR:=openwrt-build
PKG_BUILD_PARALLEL:=1

include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/cmake.mk

define Package/eigen
  SECTION:=libs
  CATEGORY:=Libraries
  TITLE:=C++ template library for linear algebra
  URL:=https://eigen.tuxfamily.org/
  DEPENDS:=+libstdcpp
endef

define Package/eigen/description
 Eigen is a C++ template library for linear algebra. It is header-only for normal consumers.
endef

CMAKE_OPTIONS += \
	-DPKGCONFIG_INSTALL_DIR=/usr/lib/pkgconfig \
	-DEIGEN_BUILD_BLAS=OFF \
	-DEIGEN_BUILD_LAPACK=OFF

define Build/InstallDev
	$(call Build/InstallDev/cmake,$(1))
endef

$(eval $(call BuildPackage,eigen))
