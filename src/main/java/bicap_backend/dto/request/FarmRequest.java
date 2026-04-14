package bicap_backend.dto.request;

public class FarmRequest {
    
    private Long userId;
    private String name;
    private String address;
    private String businessLicense;
    private String ownerName;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this address = address; }

    public String getBusinessLicense() { return businessLicense; }
    public void setBusinessLicense(String businessLicense) { this businessLicense = businessLicense; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this ownerName = ownerName; }
}
