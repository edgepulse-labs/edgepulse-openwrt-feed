include $(TOPDIR)/rules.mk

PKG_NAME:=flatbuffers
PKG_VERSION:=23.5.26
PKG_RELEASE:=1

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://codeload.github.com/google/flatbuffers/tar.gz/v$(PKG_VERSION)?
PKG_HASH:=1cce06b17cddd896b6d73cc047e36a254fb8df4d7ea18a46acf16c4c0cd3f3f3

PKG_LICENSE:=Apache-2.0
PKG_LICENSE_FILES:=LICENSE
PKG_CPE_ID:=cpe:/a:google:flatbuffers

CMAKE_INSTALL:=1
PKG_BUILD_PARALLEL:=1

include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/host-build.mk
include $(INCLUDE_DIR)/cmake.mk

define Package/flatbuffers
  SECTION:=libs
  CATEGORY:=Libraries
  TITLE:=Memory efficient serialization library
  URL:=https://flatbuffers.dev
  DEPENDS:=+libstdcpp
endef

CMAKE_OPTIONS += \
	-DCMAKE_CXX_FLAGS="-std=c++11" \
	-DCMAKE_POSITION_INDEPENDENT_CODE=ON \
	-DFLATBUFFERS_BUILD_TESTS=OFF \
	-DFLATBUFFERS_FLATC_EXECUTABLE=$(STAGING_DIR_HOSTPKG)/bin/flatc \
	-DFLATBUFFERS_BUILD_SHAREDLIB=ON

CMAKE_HOST_OPTIONS += \
	-DCMAKE_CXX_FLAGS="-std=c++11" \
	-DFLATBUFFERS_BUILD_FLATLIB=OFF \
	-DFLATBUFFERS_BUILD_FLATC=ON \
	-DFLATBUFFERS_BUILD_FLATHASH=OFF \
	-DFLATBUFFERS_BUILD_GRPCTEST=OFF \
	-DFLATBUFFERS_BUILD_SHAREDLIB=OFF \
	-DFLATBUFFERS_BUILD_TESTS=OFF

define Build/InstallDev
	$(call Build/InstallDev/cmake,$(1))
endef

define Package/flatbuffers/install
	$(INSTALL_DIR) $(1)/usr/lib
	$(CP) $(PKG_INSTALL_DIR)/usr/lib/libflatbuffers.so* $(1)/usr/lib/
endef

$(eval $(call BuildPackage,flatbuffers))
$(eval $(call HostBuild))
