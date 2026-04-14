package bicap_backend.enity;

import bicap_backend.enums.FarmStatus;
import jakarta.persistence.*;

@Entity
@Table(name = "farm")
public class Farm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "farm_id")
    private Long farmId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 255)
    private String address;

    @Column(name = "business_license", length = 255)
    private String businessLicense;

    @Column(name = "owner_name", length = 100)
    private String ownerName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FarmStatus status = FarmStatus.PENDING;

    // Getters and Setters

    public Long getFarmId() { return farmId; }
    public void setFarmId(Long farmId) { this farmId = farmId; }

    public User getUser() { return user; }
    public void setUser(User user) { this user = user; }

    public String getName() { return name; }
    public void setName(String name) { this name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this address = address; }

    public String getBusinessLicense() { return businessLicense; }
    public void setBusinessLicense(String businessLicense) { this businessLicense = businessLicense; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this ownerName = ownerName; }

    public FarmStatus getStatus() { return status; }
    public void setStatus(FarmStatus status) { this status = status; }
}
