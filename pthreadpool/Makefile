include $(TOPDIR)/rules.mk

PKG_NAME:=pthreadpool
PKG_VERSION:=560c60d342a76076f0557a3946924c6478470044
PKG_RELEASE:=1
FXDIV_VERSION:=63058eff77e11aa15bf531df5dd34395ec3017c8

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://codeload.github.com/Maratyszcza/pthreadpool/tar.gz/$(PKG_VERSION)?
PKG_HASH:=8d8ebab96df6aa12922643060e72c43bfdca9fd80cf5aacaf7391bc6850560a3

PKG_LICENSE:=BSD-2-Clause
PKG_LICENSE_FILES:=LICENSE

CMAKE_INSTALL:=1
PKG_BUILD_PARALLEL:=1

include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/cmake.mk

define Package/pthreadpool
  SECTION:=libs
  CATEGORY:=Libraries
  TITLE:=Portable thread pool implementation
  URL:=https://github.com/Maratyszcza/pthreadpool
  DEPENDS:=+fxdiv +libpthread
endef

CMAKE_OPTIONS += \
	-DCMAKE_C_FLAGS="$(TARGET_CFLAGS) -DPTHREADPOOL_USE_CPUINFO=0" \
	-DCMAKE_CXX_FLAGS="$(TARGET_CXXFLAGS) -DPTHREADPOOL_USE_CPUINFO=0" \
	-DFXDIV_SOURCE_DIR="$(BUILD_DIR)/FXdiv-$(FXDIV_VERSION)" \
	-DPTHREADPOOL_BUILD_TESTS=OFF \
	-DPTHREADPOOL_BUILD_BENCHMARKS=OFF

define Build/InstallDev
	$(call Build/InstallDev/cmake,$(1))
endef

define Package/pthreadpool/install
	$(INSTALL_DIR) $(1)/usr/lib
	$(CP) $(PKG_INSTALL_DIR)/usr/lib/libpthreadpool.so* $(1)/usr/lib/ 2>/dev/null || true
endef

$(eval $(call BuildPackage,pthreadpool))
